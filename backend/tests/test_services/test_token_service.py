import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.token_service import (
    get_or_create_free_trial,
    use_token,
    get_token_status,
    add_tokens,
)


@pytest.mark.asyncio
async def test_free_trial_creation(db_session: AsyncSession):
    """Test free trial is created for new device."""
    device_id = "test-device-free-trial"
    
    token = await get_or_create_free_trial(db_session, device_id)
    
    assert token is not None
    assert token.total_tokens == 2
    assert token.used_tokens == 0
    assert token.is_free_trial is True


@pytest.mark.asyncio
async def test_free_trial_not_duplicated(db_session: AsyncSession):
    """Test free trial is not created twice."""
    device_id = "test-device-no-duplicate"
    
    # Create free trial
    token1 = await get_or_create_free_trial(db_session, device_id)
    
    # Try to create again
    token2 = await get_or_create_free_trial(db_session, device_id)
    
    # Should return same token
    assert token1.id == token2.id


@pytest.mark.asyncio
async def test_use_token_success(db_session: AsyncSession):
    """Test using a token successfully."""
    device_id = "test-device-use-token"
    
    # Create free trial
    await get_or_create_free_trial(db_session, device_id)
    
    # Use token
    success = await use_token(db_session, device_id)
    assert success is True
    
    # Check status
    status = await get_token_status(db_session, device_id)
    assert status["used_tokens"] == 1
    assert status["remaining_tokens"] == 1


@pytest.mark.asyncio
async def test_use_token_exhausted(db_session: AsyncSession):
    """Test using token when exhausted."""
    device_id = "test-device-exhausted"
    
    # Create free trial
    await get_or_create_free_trial(db_session, device_id)
    
    # Use all tokens
    await use_token(db_session, device_id)
    await use_token(db_session, device_id)
    
    # Try to use another
    success = await use_token(db_session, device_id)
    assert success is False


@pytest.mark.asyncio
async def test_add_tokens(db_session: AsyncSession):
    """Test adding tokens from purchase."""
    device_id = "test-device-purchase"
    
    # Add purchased tokens
    token = await add_tokens(
        db_session,
        device_id=device_id,
        tokens=20,
        creem_customer_id="cust_123",
        creem_order_id="order_456",
    )
    
    assert token.total_tokens == 20
    assert token.is_free_trial is False
    assert token.creem_customer_id == "cust_123"
    
    # Check status
    status = await get_token_status(db_session, device_id)
    assert status["total_tokens"] == 20
    assert status["remaining_tokens"] == 20


@pytest.mark.asyncio
async def test_token_status_combined(db_session: AsyncSession):
    """Test token status with multiple token records."""
    device_id = "test-device-combined"
    
    # Create free trial
    await get_or_create_free_trial(db_session, device_id)
    
    # Add purchased tokens
    await add_tokens(db_session, device_id=device_id, tokens=10)
    
    # Check combined status
    status = await get_token_status(db_session, device_id)
    assert status["total_tokens"] == 12  # 2 free + 10 purchased
    assert status["remaining_tokens"] == 12
    assert status["has_free_trial"] is True
