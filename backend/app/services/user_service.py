from datetime import datetime
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.user_unit import UserUnit
from app.schemas.user import UserOut


def sync_user_units(db: Session, user: User, unit_ids: list[int]) -> None:
    db.query(UserUnit).filter(UserUnit.user_id == user.id).delete()
    for unit_id in sorted(set(unit_ids)):
        db.add(UserUnit(user_id=user.id, unit_id=unit_id))
    db.flush()


def _safe_unit_ids(user: User) -> list[int]:
    """Evita quebrar a listagem de usuários quando a tabela de vínculo ainda
    não existe ou está desatualizada no SQLite local.
    """
    try:
        return [rel.unit_id for rel in getattr(user, 'units', [])]
    except (SQLAlchemyError, AttributeError):
        return []


def serialize_user(user: User) -> UserOut:
    created_at = user.created_at or datetime.utcnow()
    return UserOut.model_validate({
        'id': user.id,
        'nome': user.nome,
        'sobrenome': user.sobrenome,
        'cpf': user.cpf,
        'email': user.email,
        'telefone': user.telefone,
        'role': user.role or 'investor',
        'is_active': bool(user.is_active),
        'is_authorized': bool(user.is_authorized),
        'must_change_password': bool(user.must_change_password),
        'created_at': created_at,
        'unit_ids': _safe_unit_ids(user),
    })
