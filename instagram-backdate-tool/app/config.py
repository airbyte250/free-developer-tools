"""Application configuration loaded from environment / .env file."""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Meta app credentials (from https://developers.facebook.com/apps)
    meta_app_id: str = ""
    meta_app_secret: str = ""
    meta_api_version: str = "v23.0"

    # Public base URL of this app; used to build the OAuth redirect URI.
    base_url: str = "http://localhost:8000"

    # Signing key for the session cookie.
    secret_key: str = "change-me-in-production"

    # SQLite by default; point at Postgres in production, e.g.
    # postgresql+psycopg://user:pass@host/db
    database_url: str = "sqlite:///./backdate.db"

    # Reject scheduling posts further than this many days into the future.
    max_future_days: int = 30

    @property
    def redirect_uri(self) -> str:
        return f"{self.base_url.rstrip('/')}/auth/callback"

    @property
    def graph_base(self) -> str:
        return f"https://graph.facebook.com/{self.meta_api_version}"


@lru_cache
def get_settings() -> Settings:
    return Settings()
