from pathlib import Path
from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.file import File, FileUnit
from app.models.unit import Unit
from app.utils.filenames import safe_filename


def save_pdf_file(upload: UploadFile) -> tuple[str, str]:
    suffix = Path(upload.filename or '').suffix.lower()
    if suffix != '.pdf':
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Apenas PDF é permitido')
    target_name = safe_filename(upload.filename or 'arquivo.pdf')
    storage_dir = Path(settings.STORAGE_DIR)
    storage_dir.mkdir(parents=True, exist_ok=True)
    destination = storage_dir / target_name
    content = upload.file.read()
    if len(content) > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Arquivo excede o limite permitido')
    destination.write_bytes(content)
    return target_name, str(destination)


def create_file_record(
    db: Session,
    *,
    titulo: str,
    tipo_arquivo: str,
    mes_referencia: str,
    ano_referencia: int,
    unit_ids: list[int],
    nome_arquivo: str,
    caminho_arquivo: str,
    uploaded_by: int,
) -> File:
    units = db.query(Unit).filter(Unit.id.in_(unit_ids)).all() if unit_ids else []
    if not units:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail='Selecione ao menos uma unidade')

    record = File(
        titulo=titulo,
        tipo_arquivo=tipo_arquivo,
        mes_referencia=mes_referencia,
        ano_referencia=ano_referencia,
        nome_arquivo=nome_arquivo,
        caminho_arquivo=caminho_arquivo,
        uploaded_by=uploaded_by,
    )
    db.add(record)
    db.flush()
    for unit in units:
        db.add(FileUnit(file_id=record.id, unit_id=unit.id))
    db.commit()
    db.refresh(record)
    return record
