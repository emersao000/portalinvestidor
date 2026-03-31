import ssl
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings


def _build_connect_args() -> dict:
    if settings.is_sqlite:
        return {'check_same_thread': False}

    if settings.is_mysql and settings.DB_SSL_ENABLED:
        context = ssl.create_default_context()
        return {'ssl': context}

    return {}


engine = create_engine(
    settings.DATABASE_URL,
    connect_args=_build_connect_args(),
    pool_pre_ping=not settings.is_sqlite,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
