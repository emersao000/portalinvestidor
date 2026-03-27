from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8', extra='ignore')

    APP_NAME: str = 'Portal do Investidor Evoque'
    ENV: str = 'development'
    API_V1_PREFIX: str = '/api/v1'
    SECRET_KEY: str = 'change-me'
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    FRONTEND_URL: str = 'http://localhost:3020'
    DATABASE_URL: str = 'sqlite:///./portal_investidor.db'
    STORAGE_DIR: str = 'storage/pdfs'
    MAX_FILE_SIZE_MB: int = 10


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
