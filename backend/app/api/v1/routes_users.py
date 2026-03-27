from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps.auth import require_admin
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserOut, UserUpdateRequest
from app.services.user_service import sync_user_units

router = APIRouter(prefix='/users', tags=['users'])


@router.get('', response_model=list[UserOut])
def list_users(db: Session = Depends(get_db), _: object = Depends(require_admin)):
    users = db.query(User).order_by(User.created_at.desc()).all()
    result = []
    for user in users:
        unit_ids = [rel.unit_id for rel in user.units]
        result.append(UserOut.model_validate({**user.__dict__, 'unit_ids': unit_ids}))
    return result


@router.patch('/{user_id}', response_model=UserOut)
def update_user(user_id: int, payload: UserUpdateRequest, db: Session = Depends(get_db), _: object = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail='Usuário não encontrado')

    data = payload.model_dump(exclude_none=True)
    unit_ids = data.pop('unit_ids', None)
    for key, value in data.items():
        setattr(user, key, value)
    if unit_ids is not None:
        sync_user_units(db, user, unit_ids)
    db.commit()
    db.refresh(user)
    return UserOut.model_validate({**user.__dict__, 'unit_ids': [rel.unit_id for rel in user.units]})
