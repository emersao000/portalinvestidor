import random
import string
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.user import User
from app.utils.validators import normalize_cpf, validate_password_strength


PASSWORD_CHARS = string.ascii_letters + string.digits


def generate_temporary_password(length: int = 6) -> str:
    return ''.join(random.SystemRandom().choice(PASSWORD_CHARS) for _ in range(length))


def generate_placeholder_cpf(db: Session) -> str:
    base = 90000000000
    while True:
        candidate = str(base)
        exists = db.query(User).filter(User.cpf == candidate).first()
        if not exists:
            return candidate
        base += 1


def register_user(db: Session, *, nome: str, cpf: str, email: str, password: str) -> dict:
    cpf = normalize_cpf(cpf)
    validate_password_strength(password)

    exists = db.query(User).filter((User.email == email.lower()) | (User.cpf == cpf)).first()
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
        must_change_password=False,
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
        'must_change_password': bool(user.must_change_password),
        'user': {
            'id': user.id,
            'nome': user.nome,
            'sobrenome': user.sobrenome,
            'email': user.email,
            'telefone': user.telefone,
            'role': user.role,
            'is_authorized': user.is_authorized,
            'must_change_password': bool(user.must_change_password),
        },
    }


def change_user_password(db: Session, *, user: User, current_password: str, new_password: str) -> dict:
    if not verify_password(current_password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Senha atual inválida')

    validate_password_strength(new_password)
    user.password_hash = get_password_hash(new_password)
    user.must_change_password = False
    db.commit()
    db.refresh(user)
    return {'message': 'Senha atualizada com sucesso'}
