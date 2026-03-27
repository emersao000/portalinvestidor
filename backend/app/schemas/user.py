from datetime import datetime
from pydantic import BaseModel, EmailStr


class UserOut(BaseModel):
    id: int
    nome: str
    cpf: str
    email: EmailStr
    role: str
    is_active: bool
    is_authorized: bool
    created_at: datetime
    unit_ids: list[int] = []

    model_config = {'from_attributes': True}


class UserUpdateRequest(BaseModel):
    nome: str | None = None
    is_active: bool | None = None
    is_authorized: bool | None = None
    role: str | None = None
    unit_ids: list[int] | None = None
