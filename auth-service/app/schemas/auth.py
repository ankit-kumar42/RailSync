from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    user_id: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=1)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: str
    department: str
    role: str


class UserResponse(BaseModel):
    user_id: str
    department: str
    name: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True