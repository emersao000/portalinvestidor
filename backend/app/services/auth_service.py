from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.user import User
from app.utils.validators import normalize_cpf, validate_password_strength


def register_user(db: Session, *, nome: str, cpf: str, email: str, password: str) -> dict:
    cpf = normalize_cpf(cpf)
    validate_password_strength(password)

    exists = db.query(User).filter((User.email == email) | (User.cpf == cpf)).first()
    if exists:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail='Usuário já cadastrado')

    user = User(
        nome=nome,
        cpf=cpf,
        email=email.lower(),
        password_hash=get_password_hash(password),
        role='investor',
        is_active=True,
        is_authorized=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {
        'message': 'Cadastro realizado com sucesso. Aguardando aprovação do administrador.',
        'user_id': user.id,
    }


def login_user(db: Session, *, email: str, password: str) -> dict:
    user = db.query(User).filter(User.email == email.lower()).first()
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Credenciais inválidas')

    token = create_access_token(user.email)
    return {
        'access_token': token,
        'token_type': 'bearer',
        'user': {
            'id': user.id,
            'nome': user.nome,
            'email': user.email,
            'role': user.role,
            'is_authorized': user.is_authorized,
        },
    }
