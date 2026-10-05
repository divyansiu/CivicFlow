from functools import lru_cache
from typing import List
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings for CivicFlow Backend API.
    Owned by Member 3 (Backend Core / API).
    """
    APP_NAME: str = "CivicFlow"
    APP_VERSION: str = "1.0.0"
    APP_ENV: str = "development"
    API_PREFIX: str = "/api"
    DEBUG: bool = False
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # CORS configuration
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # Model and DB references (consumed boundaries)
    SQLITE_DB_PATH: str = "backend/data/civicflow.db"
    ML_MODEL_PATH: str = "backend/app/ml/model.pkl"

    # Decision Engine Weights (PRD Section 5.4: 0.50 Risk + 0.25 Urgency + 0.25 Impact)
    PRIORITY_WEIGHT_RISK: float = 0.50
    PRIORITY_WEIGHT_URGENCY: float = 0.25
    PRIORITY_WEIGHT_IMPACT: float = 0.25

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v):
        if isinstance(v, str) and not v.startswith("["):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)


@lru_cache()
def get_settings() -> Settings:
    """Returns cached settings instance."""
    return Settings()
