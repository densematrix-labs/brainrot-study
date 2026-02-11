from fastapi import APIRouter
from app.api.v1 import brainrot, payment, metrics

api_router = APIRouter()
api_router.include_router(brainrot.router)
api_router.include_router(payment.router)
api_router.include_router(metrics.router)
