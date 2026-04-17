from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_db: str = "orderbuddy"

    # Legacy: when True, skip all outbound payment calls (default for local dev).
    payment_gateway_mock: bool = True
    # mock | http (generic JSON POST) | emergepay (ChargeIt Pro virtual terminal checkout)
    payment_provider: Literal["mock", "http", "emergepay"] = "mock"
    payment_gateway_url: str | None = None
    payment_timeout_seconds: float = 15.0

    circuit_failure_threshold: int = 5
    circuit_open_seconds: float = 30.0

    # Emergepay: use static config, or load oid/auth from `locations` document (matches NestJS PaymentsService).
    emergepay_environment_url: str | None = None
    emergepay_oid: str | None = None
    emergepay_auth_token: str | None = None
    emergepay_credentials_from_location: bool = True

    host: str = "0.0.0.0"
    port: int = 8081


settings = Settings()
