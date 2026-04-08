from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "CryptoHub Analysis API"
    API_V1_PREFIX: str = "/api/v1"
    DEBUG: bool = False

    DATABASE_URL: str = "postgresql+asyncpg://cryptohub:cryptohub@localhost:5432/cryptohub"
    REDIS_URL: str = "redis://localhost:6379/0"

    INFLUX_URL: str = "http://localhost:8086"
    INFLUX_TOKEN: str = ""
    INFLUX_ORG: str = "cryptohub"
    INFLUX_BUCKET: str = "market_data"

    KAFKA_BOOTSTRAP: str = "localhost:9092"

    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    COINGECKO_BASE_URL: str = "https://api.coingecko.com/api/v3"

    model_config = {"env_file": ".env", "case_sensitive": True}


settings = Settings()
