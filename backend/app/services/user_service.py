from sqlalchemy.orm import Session
from app.models.user import User
from app.models.user_unit import UserUnit


def sync_user_units(db: Session, user: User, unit_ids: list[int]) -> None:
    db.query(UserUnit).filter(UserUnit.user_id == user.id).delete()
    for unit_id in unit_ids:
        db.add(UserUnit(user_id=user.id, unit_id=unit_id))
    db.flush()
