from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.token import GenerationToken
from typing import Optional


async def get_or_create_free_trial(db: AsyncSession, device_id: str) -> Optional[GenerationToken]:
    """Get existing tokens or create a free trial for new users."""
    # Check for existing tokens
    result = await db.execute(
        select(GenerationToken).where(GenerationToken.device_id == device_id)
    )
    tokens = result.scalars().all()
    
    # Calculate total remaining
    total_remaining = sum(t.remaining_tokens for t in tokens)
    
    if total_remaining > 0:
        # Return first token record with remaining tokens
        for t in tokens:
            if t.remaining_tokens > 0:
                return t
        return None
    
    # Check if already used free trial
    has_free_trial = any(t.is_free_trial for t in tokens)
    
    if has_free_trial:
        return None  # Already used free trial, no tokens left
    
    # Create free trial
    free_trial = GenerationToken(
        device_id=device_id,
        total_tokens=2,  # 2 free conversions
        used_tokens=0,
        is_free_trial=True,
    )
    db.add(free_trial)
    await db.commit()
    await db.refresh(free_trial)
    return free_trial


async def use_token(db: AsyncSession, device_id: str) -> bool:
    """Use one token. Returns True if successful, False if no tokens available."""
    result = await db.execute(
        select(GenerationToken)
        .where(GenerationToken.device_id == device_id)
        .order_by(GenerationToken.created_at)
    )
    tokens = result.scalars().all()
    
    for token in tokens:
        if token.remaining_tokens > 0:
            token.used_tokens += 1
            await db.commit()
            return True
    
    return False


async def get_token_status(db: AsyncSession, device_id: str) -> dict:
    """Get token status for a device."""
    result = await db.execute(
        select(GenerationToken).where(GenerationToken.device_id == device_id)
    )
    tokens = result.scalars().all()
    
    total = sum(t.total_tokens for t in tokens)
    used = sum(t.used_tokens for t in tokens)
    has_free_trial = any(t.is_free_trial for t in tokens)
    
    return {
        "total_tokens": total,
        "used_tokens": used,
        "remaining_tokens": total - used,
        "has_free_trial": has_free_trial,
        "free_trial_used": has_free_trial and all(t.remaining_tokens == 0 for t in tokens if t.is_free_trial),
    }


async def add_tokens(
    db: AsyncSession,
    device_id: str,
    tokens: int,
    creem_customer_id: Optional[str] = None,
    creem_order_id: Optional[str] = None,
) -> GenerationToken:
    """Add tokens to a device (from purchase)."""
    token_record = GenerationToken(
        device_id=device_id,
        total_tokens=tokens,
        used_tokens=0,
        is_free_trial=False,
        creem_customer_id=creem_customer_id,
        creem_order_id=creem_order_id,
    )
    db.add(token_record)
    await db.commit()
    await db.refresh(token_record)
    return token_record
