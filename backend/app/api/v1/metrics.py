from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
from fastapi import APIRouter
from fastapi.responses import Response
from app.core.config import settings

router = APIRouter()

# HTTP Metrics
http_requests = Counter(
    "http_requests_total",
    "Total HTTP requests",
    ["tool", "endpoint", "method", "status"]
)

http_request_duration = Histogram(
    "http_request_duration_seconds",
    "HTTP request duration in seconds",
    ["tool", "endpoint", "method"]
)

# Payment Metrics
payment_success = Counter(
    "payment_success_total",
    "Successful payments",
    ["tool", "product_sku"]
)

payment_revenue = Counter(
    "payment_revenue_cents_total",
    "Total revenue in cents",
    ["tool"]
)

# Token Metrics
tokens_consumed = Counter(
    "tokens_consumed_total",
    "Total tokens consumed",
    ["tool"]
)

free_trial_used = Counter(
    "free_trial_used_total",
    "Free trials used",
    ["tool"]
)

# Core Function Metrics
core_function_calls = Counter(
    "core_function_calls_total",
    "Core function calls",
    ["tool", "function"]
)

# SEO Metrics
page_views = Counter(
    "page_views_total",
    "Total page views",
    ["tool", "page"]
)

programmatic_pages = Gauge(
    "programmatic_pages_count",
    "Number of programmatic SEO pages",
    ["tool"]
)

crawler_visits = Counter(
    "crawler_visits_total",
    "Crawler visits",
    ["tool", "bot"]
)


@router.get("/metrics")
async def get_metrics():
    """Expose Prometheus metrics."""
    return Response(
        content=generate_latest(),
        media_type=CONTENT_TYPE_LATEST
    )
