from fastapi import APIRouter, Depends, File as FastFile, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session
from app.api.deps.auth import require_admin, require_authorized_user
from app.db.session import get_db
from app.models.file import File, FileUnit
from app.models.unit import Unit
from app.models.user import User
from app.models.user_unit import UserUnit
from app.schemas.file import FileOut
from app.schemas.unit import UnitCreate, UnitOut, UnitUpdate
from app.schemas.user import UserOut
from app.services.file_service import create_file_record, save_pdf_file

router = APIRouter(prefix='/units', tags=['units'])


@router.get('', response_model=list[UnitOut])
def list_units(db: Session = Depends(get_db), current_user: User = Depends(require_authorized_user)):
    query = db.query(Unit).order_by(Unit.nome.asc())
    if current_user.role != 'admin':
        query = query.join(UserUnit, UserUnit.unit_id == Unit.id).filter(UserUnit.user_id == current_user.id)
    return query.all()


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


@router.get('/{unit_id}/users', response_model=list[UserOut])
def list_unit_users(unit_id: int, db: Session = Depends(get_db), _: object = Depends(require_admin)):
    unit = db.query(Unit).filter(Unit.id == unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail='Unidade não encontrada')
    users = (
        db.query(User)
        .join(UserUnit, UserUnit.user_id == User.id)
        .filter(UserUnit.unit_id == unit_id)
        .order_by(User.nome.asc())
        .all()
    )
    return [UserOut.model_validate({**user.__dict__, 'unit_ids': [rel.unit_id for rel in user.units]}) for user in users]


@router.get('/{unit_id}/files', response_model=list[FileOut])
def list_unit_files(unit_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_authorized_user)):
    unit = db.query(Unit).filter(Unit.id == unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail='Unidade não encontrada')
    if current_user.role != 'admin':
        has_access = db.query(UserUnit).filter(UserUnit.user_id == current_user.id, UserUnit.unit_id == unit_id).first()
        if not has_access:
            raise HTTPException(status_code=403, detail='Sem permissão para esta unidade')
    records = (
        db.query(File)
        .join(FileUnit, FileUnit.file_id == File.id)
        .filter(FileUnit.unit_id == unit_id)
        .order_by(File.created_at.desc())
        .all()
    )
    return [
        FileOut.model_validate({
            **record.__dict__,
            'unit_ids': [rel.unit_id for rel in record.units],
            'unit_names': [rel.unit.nome for rel in record.units],
        })
        for record in records
    ]


@router.post('/{unit_id}/files', response_model=FileOut)
def upload_unit_file(
    unit_id: int,
    titulo: str = Form(...),
    tipo_arquivo: str = Form(...),
    mes_referencia: str = Form(...),
    ano_referencia: int = Form(...),
    upload: UploadFile = FastFile(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    unit = db.query(Unit).filter(Unit.id == unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail='Unidade não encontrada')
    safe_name, file_path = save_pdf_file(upload)
    record = create_file_record(
        db,
        titulo=titulo,
        tipo_arquivo=tipo_arquivo,
        mes_referencia=mes_referencia,
        ano_referencia=ano_referencia,
        unit_ids=[unit_id],
        nome_arquivo=safe_name,
        caminho_arquivo=file_path,
        uploaded_by=current_user.id,
    )
    return FileOut.model_validate({
        **record.__dict__,
        'unit_ids': [rel.unit_id for rel in record.units],
        'unit_names': [rel.unit.nome for rel in record.units],
    })
