from typing import Optional, Any
from pydantic import BaseModel, EmailStr, Field

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: Any = None

class TokenPayload(BaseModel):
    sub: str
    role: str
    type: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)

class RefreshTokenRequest(BaseModel):
    refresh_token: str
