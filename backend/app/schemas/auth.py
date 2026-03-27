from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    nome: str = Field(min_length=3, max_length=150)
    cpf: str = Field(min_length=11, max_length=14)
    email: EmailStr
    password: str = Field(min_length=8, max_length=64)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = 'bearer'
    user: dict
