from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import re

from app.core.config import settings
from app.core.database import init_db
from app.api.v1 import api_router
from app.api.v1.metrics import crawler_visits, http_request_duration
import time


BOT_PATTERNS = ["Googlebot", "bingbot", "Baiduspider", "YandexBot", "DuckDuckBot", "Slurp", "facebookexternalhit"]


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    yield
    # Shutdown


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def track_requests(request: Request, call_next):
    """Track request metrics and crawler visits."""
    start_time = time.time()
    
    # Track crawler visits
    ua = request.headers.get("user-agent", "")
    for bot in BOT_PATTERNS:
        if bot.lower() in ua.lower():
            crawler_visits.labels(tool=settings.TOOL_NAME, bot=bot).inc()
            break
    
    response = await call_next(request)
    
    # Track request duration
    duration = time.time() - start_time
    path = request.url.path
    # Normalize path for metrics
    if path.startswith("/api/"):
        http_request_duration.labels(
            tool=settings.TOOL_NAME,
            endpoint=path,
            method=request.method
        ).observe(duration)
    
    return response


# Include API routes
app.include_router(api_router)


@app.get("/")
async def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
