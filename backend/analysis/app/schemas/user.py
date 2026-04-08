import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=6, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    username: str
    avatar_url: Optional[str] = None
    language: str = "zh-CN"
    theme: str = "auto"
    timezone: str = "Asia/Shanghai"
    is_active: bool = True
    is_admin: bool = False
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class ProfileUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=100)
    avatar_url: Optional[str] = None
    language: Optional[str] = None
    theme: Optional[str] = None
    timezone: Optional[str] = None


class RefreshRequest(BaseModel):
    refresh_token: str
