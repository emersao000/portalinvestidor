from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps.auth import get_current_user
from app.core.rate_limit import rate_limit
from app.db.session import get_db
from app.schemas.auth import LoginRequest, RegisterRequest
from app.services.auth_service import login_user, register_user

router = APIRouter(prefix='/auth', tags=['auth'])


@router.post('/register', dependencies=[Depends(rate_limit(10, 300))])
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    return register_user(db, nome=payload.nome, cpf=payload.cpf, email=payload.email, password=payload.password)


@router.post('/login', dependencies=[Depends(rate_limit(10, 60))])
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    return login_user(db, email=payload.email, password=payload.password)


@router.get('/me')
def me(current_user=Depends(get_current_user)):
    return {
        'id': current_user.id,
        'nome': current_user.nome,
        'email': current_user.email,
        'role': current_user.role,
        'is_authorized': current_user.is_authorized,
    }
