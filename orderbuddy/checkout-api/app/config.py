from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_db: str = "orderbuddy"

    payment_gateway_url: str | None = None
    payment_gateway_mock: bool = True
    payment_timeout_seconds: float = 15.0

    circuit_failure_threshold: int = 5
    circuit_open_seconds: float = 30.0

    host: str = "0.0.0.0"
    port: int = 8081


settings = Settings()
