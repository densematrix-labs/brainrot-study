from sqlalchemy import Column, String, Integer, DateTime, Boolean
from sqlalchemy.sql import func
from app.core.database import Base


class GenerationToken(Base):
    __tablename__ = "generation_tokens"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    device_id = Column(String(255), nullable=False, index=True)
    total_tokens = Column(Integer, nullable=False, default=0)
    used_tokens = Column(Integer, nullable=False, default=0)
    creem_customer_id = Column(String(255), nullable=True)
    creem_order_id = Column(String(255), nullable=True)
    is_free_trial = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    @property
    def remaining_tokens(self) -> int:
        return max(0, self.total_tokens - self.used_tokens)


class PaymentTransaction(Base):
    __tablename__ = "payment_transactions"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    device_id = Column(String(255), nullable=False, index=True)
    creem_checkout_id = Column(String(255), nullable=True)
    creem_order_id = Column(String(255), nullable=True)
    product_sku = Column(String(100), nullable=False)
    amount_cents = Column(Integer, nullable=False)
    currency = Column(String(10), nullable=False, default="USD")
    status = Column(String(50), nullable=False, default="pending")
    created_at = Column(DateTime, server_default=func.now())
    completed_at = Column(DateTime, nullable=True)
