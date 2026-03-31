from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps.auth import require_authorized_user
from app.db.session import get_db
from app.models.unit import Unit
from app.models.user_unit import UserUnit

router = APIRouter(prefix='/investor', tags=['investor'])


@router.get('/units')
def my_units(db: Session = Depends(get_db), current_user=Depends(require_authorized_user)):
    if current_user.role == 'admin':
        units = db.query(Unit).all()
    else:
        units = (
            db.query(Unit)
            .join(UserUnit, UserUnit.unit_id == Unit.id)
            .filter(UserUnit.user_id == current_user.id)
            .order_by(Unit.nome.asc())
            .all()
        )
    return units
