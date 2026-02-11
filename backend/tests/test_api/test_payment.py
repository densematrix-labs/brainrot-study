import pytest
from httpx import AsyncClient
from unittest.mock import patch, AsyncMock


@pytest.mark.asyncio
async def test_get_products(client: AsyncClient):
    """Test getting available products."""
    response = await client.get("/api/v1/payment/products")
    assert response.status_code == 200
    data = response.json()
    assert "products" in data
    assert len(data["products"]) == 3
    
    # Check product structure
    for product in data["products"]:
        assert "id" in product
        assert "name" in product
        assert "tokens" in product
        assert "price" in product


@pytest.mark.asyncio
async def test_checkout_invalid_product(client: AsyncClient):
    """Test checkout with invalid product ID."""
    response = await client.post(
        "/api/v1/payment/checkout",
        json={
            "product_id": "invalid_product",
            "device_id": "test-device",
            "success_url": "https://example.com/success"
        }
    )
    assert response.status_code == 400
    assert "Invalid product" in response.json()["detail"]


@pytest.mark.asyncio
async def test_checkout_not_configured(client: AsyncClient):
    """Test checkout when Creem not configured."""
    response = await client.post(
        "/api/v1/payment/checkout",
        json={
            "product_id": "brainrot_5",
            "device_id": "test-device",
            "success_url": "https://example.com/success"
        }
    )
    # Should fail because CREEM_PRODUCT_IDS is not configured
    assert response.status_code == 500
    assert "not configured" in response.json()["detail"]


@pytest.mark.asyncio
async def test_webhook_invalid_signature(client: AsyncClient):
    """Test webhook with invalid signature."""
    with patch("app.core.config.settings.CREEM_WEBHOOK_SECRET", "test-secret"):
        response = await client.post(
            "/api/v1/payment/webhook",
            json={"type": "checkout.completed", "object": {}},
            headers={"creem-signature": "invalid"}
        )
        assert response.status_code == 401
