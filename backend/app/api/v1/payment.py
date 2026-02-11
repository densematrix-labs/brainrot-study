from fastapi import APIRouter, HTTPException, Depends, Header, Request
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional
import httpx
import hmac
import hashlib
import json

from app.core.config import settings
from app.core.database import get_db
from app.models.token import PaymentTransaction
from app.services.token_service import add_tokens
from app.api.v1.metrics import payment_success, payment_revenue

router = APIRouter(prefix="/api/v1/payment", tags=["payment"])

CREEM_API_BASE = "https://api.creem.io/v1"

# Product configuration
PRODUCTS = {
    "brainrot_5": {"tokens": 5, "price_cents": 499, "name": "5 Conversions"},
    "brainrot_20": {"tokens": 20, "price_cents": 1499, "name": "20 Conversions"},
    "brainrot_50": {"tokens": 50, "price_cents": 2999, "name": "50 Conversions"},
}


class CheckoutRequest(BaseModel):
    product_id: str
    device_id: str
    success_url: str
    cancel_url: Optional[str] = None


class CheckoutResponse(BaseModel):
    checkout_url: str
    checkout_id: str


@router.get("/products")
async def get_products():
    """Get available products."""
    return {
        "products": [
            {
                "id": pid,
                "name": p["name"],
                "tokens": p["tokens"],
                "price": p["price_cents"] / 100,
                "currency": "USD",
            }
            for pid, p in PRODUCTS.items()
        ]
    }


@router.post("/checkout", response_model=CheckoutResponse)
async def create_checkout(
    request: CheckoutRequest,
    db: AsyncSession = Depends(get_db),
):
    """Create a Creem checkout session."""
    if request.product_id not in PRODUCTS:
        raise HTTPException(status_code=400, detail="Invalid product ID")
    
    product = PRODUCTS[request.product_id]
    
    # Get Creem product ID from env
    try:
        creem_product_ids = json.loads(settings.CREEM_PRODUCT_IDS)
        creem_product_id = creem_product_ids.get(request.product_id)
    except:
        creem_product_id = None
    
    if not creem_product_id:
        raise HTTPException(status_code=500, detail="Payment not configured")
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{CREEM_API_BASE}/checkouts",
            headers={
                "Authorization": f"Bearer {settings.CREEM_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "product_id": creem_product_id,
                "success_url": request.success_url,
                "request_id": f"{request.device_id}_{request.product_id}",
                "metadata": {
                    "device_id": request.device_id,
                    "product_sku": request.product_id,
                    "tokens": product["tokens"],
                },
            },
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to create checkout")
        
        data = response.json()
    
    # Record transaction
    transaction = PaymentTransaction(
        device_id=request.device_id,
        creem_checkout_id=data.get("id"),
        product_sku=request.product_id,
        amount_cents=product["price_cents"],
        status="pending",
    )
    db.add(transaction)
    await db.commit()
    
    return CheckoutResponse(
        checkout_url=data.get("checkout_url"),
        checkout_id=data.get("id"),
    )


@router.post("/webhook")
async def handle_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Handle Creem webhook events."""
    body = await request.body()
    signature = request.headers.get("creem-signature", "")
    
    # Verify signature
    if settings.CREEM_WEBHOOK_SECRET:
        expected = hmac.new(
            settings.CREEM_WEBHOOK_SECRET.encode(),
            body,
            hashlib.sha256,
        ).hexdigest()
        
        if not hmac.compare_digest(signature, expected):
            raise HTTPException(status_code=401, detail="Invalid signature")
    
    data = json.loads(body)
    event_type = data.get("type")
    
    if event_type == "checkout.completed":
        checkout = data.get("object", {})
        metadata = checkout.get("metadata", {})
        
        device_id = metadata.get("device_id")
        product_sku = metadata.get("product_sku")
        tokens = metadata.get("tokens", 0)
        
        if device_id and tokens:
            # Add tokens
            await add_tokens(
                db,
                device_id=device_id,
                tokens=int(tokens),
                creem_customer_id=checkout.get("customer", {}).get("id"),
                creem_order_id=checkout.get("order", {}).get("id"),
            )
            
            # Update metrics
            product = PRODUCTS.get(product_sku, {})
            payment_success.labels(tool=settings.TOOL_NAME, product_sku=product_sku).inc()
            payment_revenue.labels(tool=settings.TOOL_NAME).inc(product.get("price_cents", 0))
    
    return {"received": True}


@router.get("/success")
async def payment_success_page(
    checkout_id: str,
    x_device_id: str = Header(..., alias="X-Device-Id"),
    db: AsyncSession = Depends(get_db),
):
    """Get payment success info."""
    status = await get_token_status(db, x_device_id)
    return {
        "success": True,
        "message": "Payment successful! Your tokens have been added.",
        "tokens": status,
    }


# Import at bottom to avoid circular import
from app.services.token_service import get_token_status
