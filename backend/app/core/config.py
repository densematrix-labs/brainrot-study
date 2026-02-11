from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings."""
    
    # App settings
    APP_NAME: str = "Brainrot Study Platform"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # LLM Proxy
    LLM_PROXY_URL: str = "https://llm-proxy.densematrix.ai"
    LLM_PROXY_KEY: str = ""
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./brainrot.db"
    
    # Creem Payment
    CREEM_API_KEY: str = ""
    CREEM_WEBHOOK_SECRET: str = ""
    CREEM_PRODUCT_IDS: str = "{}"
    
    # Tool identification for metrics
    TOOL_NAME: str = "brainrot-study"
    
    class Config:
        env_file = ".env"
        extra = "allow"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
