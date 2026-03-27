from sqlalchemy.orm import Session
from app.core.security import get_password_hash
from app.models.user import User
from app.db.base import Base
from app.db.session import engine


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
    with Session(engine) as db:
        admin = db.query(User).filter(User.email == 'admin@evoque.local').first()
        if not admin:
            db.add(
                User(
                    nome='Administrador Evoque',
                    cpf='00000000000',
                    email='admin@evoque.local',
                    password_hash=get_password_hash('Admin@1234'),
                    role='admin',
                    is_active=True,
                    is_authorized=True,
                )
            )
            db.commit()
