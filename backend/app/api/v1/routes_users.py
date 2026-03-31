from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps.auth import require_admin
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import AdminCreateUserRequest, AdminCreateUserResponse, UserOut, UserUpdateRequest
from app.services.auth_service import generate_placeholder_cpf, generate_temporary_password
from app.services.user_service import serialize_user, sync_user_units
from app.core.security import get_password_hash

router = APIRouter(prefix='/users', tags=['users'])


@router.get('', response_model=list[UserOut])
def list_users(db: Session = Depends(get_db), _: object = Depends(require_admin)):
    users = db.query(User).order_by(User.id.desc()).all()
    return [serialize_user(user) for user in users]


@router.post('', response_model=AdminCreateUserResponse, status_code=status.HTTP_201_CREATED)
def create_user(payload: AdminCreateUserRequest, db: Session = Depends(get_db), _: object = Depends(require_admin)):
    existing = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing:
        raise HTTPException(status_code=409, detail='Já existe um usuário com esse e-mail')

    generated_password = generate_temporary_password(6)
    user = User(
        nome=payload.nome.strip(),
        sobrenome=payload.sobrenome.strip(),
        cpf=generate_placeholder_cpf(db),
        email=payload.email.lower(),
        telefone=payload.telefone.strip(),
        password_hash=get_password_hash(generated_password),
        role='admin' if payload.role == 'admin' else 'investor',
        is_active=True,
        is_authorized=payload.is_authorized,
        must_change_password=payload.must_change_password,
    )
    db.add(user)
    db.flush()

    if payload.unit_ids:
        sync_user_units(db, user, payload.unit_ids)

    db.commit()
    db.refresh(user)

    return AdminCreateUserResponse(
        message='Usuário criado com sucesso',
        generated_password=generated_password,
        user=serialize_user(user),
    )


@router.patch('/{user_id}', response_model=UserOut)
def update_user(user_id: int, payload: UserUpdateRequest, db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail='Usuário não encontrado')

    data = payload.model_dump(exclude_none=True)
    unit_ids = data.pop('unit_ids', None)
    role = data.get('role')
    if role not in (None, 'admin', 'investor'):
        raise HTTPException(status_code=422, detail='Perfil inválido')
    if user.id == current_admin.id and data.get('is_active') is False:
        raise HTTPException(status_code=400, detail='Você não pode bloquear o próprio usuário')
    for key, value in data.items():
        setattr(user, key, value)
    if unit_ids is not None:
        sync_user_units(db, user, unit_ids)
    db.commit()
    db.refresh(user)
    return serialize_user(user)


@router.post('/{user_id}/reset-password')
def reset_user_password(
    user_id: int,
    force_change_on_first_access: bool = True,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail='Usuário não encontrado')
    if user.id == current_admin.id:
        raise HTTPException(status_code=400, detail='Você não pode resetar a própria senha por esta tela')

    generated_password = generate_temporary_password(6)
    user.password_hash = get_password_hash(generated_password)
    user.must_change_password = bool(force_change_on_first_access)
    db.commit()
    db.refresh(user)
    return {
        'message': 'Senha redefinida com sucesso',
        'generated_password': generated_password,
        'must_change_password': bool(user.must_change_password),
        'user': serialize_user(user),
    }


@router.delete('/{user_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail='Usuário não encontrado')
    if user.id == current_admin.id:
        raise HTTPException(status_code=400, detail='Você não pode excluir o próprio usuário')
    db.delete(user)
    db.commit()
