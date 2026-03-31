from pathlib import Path
from fastapi import APIRouter, Depends, File as FastFile, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.api.deps.auth import require_admin, require_authorized_user
from app.db.session import get_db
from app.models.file import File, FileUnit
from app.models.user_unit import UserUnit
from app.schemas.file import FileOut
from app.services.file_service import create_file_record, save_pdf_file

router = APIRouter(prefix='/files', tags=['files'])


@router.get('', response_model=list[FileOut])
def list_files(db: Session = Depends(get_db), current_user=Depends(require_authorized_user)):
    query = db.query(File)
    if current_user.role != 'admin':
        allowed_units = db.query(UserUnit.unit_id).filter(UserUnit.user_id == current_user.id)
        query = query.join(FileUnit).filter(FileUnit.unit_id.in_(allowed_units))
    records = query.order_by(File.created_at.desc()).distinct().all()
    output = []
    for record in records:
        output.append(
            FileOut.model_validate(
                {
                    **record.__dict__,
                    'unit_ids': [rel.unit_id for rel in record.units],
                    'unit_names': [rel.unit.nome for rel in record.units],
                }
            )
        )
    return output


@router.post('/upload', response_model=FileOut)
def upload_file(
    titulo: str = Form(...),
    tipo_arquivo: str = Form(...),
    mes_referencia: str = Form(...),
    ano_referencia: int = Form(...),
    unit_ids: str = Form(...),
    upload: UploadFile = FastFile(...),
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    safe_name, file_path = save_pdf_file(upload)
    ids = [int(item) for item in unit_ids.split(',') if item.strip().isdigit()]
    record = create_file_record(
        db,
        titulo=titulo,
        tipo_arquivo=tipo_arquivo,
        mes_referencia=mes_referencia,
        ano_referencia=ano_referencia,
        unit_ids=ids,
        nome_arquivo=safe_name,
        caminho_arquivo=file_path,
        uploaded_by=current_user.id,
    )
    return FileOut.model_validate(
        {
            **record.__dict__,
            'unit_ids': [rel.unit_id for rel in record.units],
            'unit_names': [rel.unit.nome for rel in record.units],
        }
    )


@router.get('/{file_id}/download')
def download_file(file_id: int, db: Session = Depends(get_db), current_user=Depends(require_authorized_user)):
    record = db.query(File).filter(File.id == file_id).first()
    if not record:
        raise HTTPException(status_code=404, detail='Arquivo não encontrado')
    if current_user.role != 'admin':
        allowed_unit_ids = {rel.unit_id for rel in current_user.units}
        record_unit_ids = {rel.unit_id for rel in record.units}
        if not allowed_unit_ids.intersection(record_unit_ids):
            raise HTTPException(status_code=403, detail='Sem permissão para este arquivo')
    path = Path(record.caminho_arquivo)
    if not path.exists():
        raise HTTPException(status_code=404, detail='Arquivo físico não encontrado')
    return FileResponse(path=str(path), media_type='application/pdf', filename=record.nome_arquivo)



@router.delete('/{file_id}')
def delete_file(file_id: int, db: Session = Depends(get_db), _: object = Depends(require_admin)):
    record = db.query(File).filter(File.id == file_id).first()
    if not record:
        raise HTTPException(status_code=404, detail='Arquivo não encontrado')
    path = Path(record.caminho_arquivo)
    db.delete(record)
    db.commit()
    if path.exists():
        try:
            path.unlink()
        except OSError:
            pass
    return {'message': 'Arquivo removido com sucesso'}
