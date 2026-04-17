from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import AnyHttpUrl, field_validator
from typing import List


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # ── App ──────────────────────────────────────────────────────────────────
    APP_NAME: str = "TNA Medical"
    APP_URL: str = "http://localhost:3000"
    DEBUG: bool = False

    # ── Database ─────────────────────────────────────────────────────────────
    DATABASE_URL: str
    DATABASE_URL_SYNC: str = ""

    # ── Redis ─────────────────────────────────────────────────────────────────
    REDIS_URL: str = "redis://localhost:6379/0"

    # ── Security ──────────────────────────────────────────────────────────────
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    BCRYPT_ROUNDS: int = 12

    # ── CORS ──────────────────────────────────────────────────────────────────
    ALLOWED_ORIGINS: str | List[str] = ["http://localhost:3000"]

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_cors(cls, v: str | List[str]) -> List[str]:
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v

    # ── Stripe ────────────────────────────────────────────────────────────────
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""

    # ── Omise (PromptPay) ─────────────────────────────────────────────────────
    OMISE_SECRET_KEY: str = ""
    OMISE_PUBLIC_KEY: str = ""

    # ── Email ─────────────────────────────────────────────────────────────────
    RESEND_API_KEY: str = ""
    EMAIL_FROM: str = "TNA Supplement <no-reply@tna-supplement.com>"

    # ── Storage ───────────────────────────────────────────────────────────────
    S3_BUCKET: str = ""
    S3_REGION: str = "ap-southeast-1"
    S3_ENDPOINT: str = ""
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    CDN_URL: str = ""

    # ── Admin seed ────────────────────────────────────────────────────────────
    FIRST_ADMIN_EMAIL: str = "admin@tna-supplement.com"
    FIRST_ADMIN_PASSWORD: str = ""


settings = Settings()  # type: ignore[call-arg]
