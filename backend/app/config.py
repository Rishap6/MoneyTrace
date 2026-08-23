"""Application configuration management using Pydantic Settings."""

from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = (BASE_DIR / "moneytrace.db").as_posix()


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Database
    DATABASE_URL: str = f"sqlite+aiosqlite:///{DB_PATH}"

    # Security / Auth
    SECRET_KEY: str = "super-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Environment
    ENVIRONMENT: str = "development"

    # CORS
    FRONTEND_ORIGIN: str = "http://localhost:5173"

    # JWT
    ALGORITHM: str = "HS256"


settings = Settings()

