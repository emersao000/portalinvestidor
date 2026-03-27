from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps.auth import require_admin, require_authorized_user
from app.db.session import get_db
from app.models.unit import Unit
from app.schemas.unit import UnitCreate, UnitOut, UnitUpdate

router = APIRouter(prefix='/units', tags=['units'])


@router.get('', response_model=list[UnitOut])
def list_units(db: Session = Depends(get_db), _: object = Depends(require_authorized_user)):
    return db.query(Unit).order_by(Unit.nome.asc()).all()


@router.post('', response_model=UnitOut)
def create_unit(payload: UnitCreate, db: Session = Depends(get_db), _: object = Depends(require_admin)):
    exists = db.query(Unit).filter(Unit.nome == payload.nome).first()
    if exists:
        raise HTTPException(status_code=409, detail='Unidade já cadastrada')
    unit = Unit(**payload.model_dump())
    db.add(unit)
    db.commit()
    db.refresh(unit)
    return unit


@router.patch('/{unit_id}', response_model=UnitOut)
def update_unit(unit_id: int, payload: UnitUpdate, db: Session = Depends(get_db), _: object = Depends(require_admin)):
    unit = db.query(Unit).filter(Unit.id == unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail='Unidade não encontrada')
    for key, value in payload.model_dump(exclude_none=True).items():
        setattr(unit, key, value)
    db.commit()
    db.refresh(unit)
    return unit


@router.delete('/{unit_id}')
def delete_unit(unit_id: int, db: Session = Depends(get_db), _: object = Depends(require_admin)):
    unit = db.query(Unit).filter(Unit.id == unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail='Unidade não encontrada')
    db.delete(unit)
    db.commit()
    return {'message': 'Unidade removida com sucesso'}
