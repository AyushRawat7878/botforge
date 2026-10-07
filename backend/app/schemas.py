from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class RegisterIn(BaseModel):
    username: str = Field(min_length=3, max_length=40, pattern=r"^[A-Za-z0-9_]+$")
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class LoginIn(BaseModel):
    username: str
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    username: str
    email: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class BotIn(BaseModel):
    name: str = Field(min_length=1, max_length=60)
    description: str = Field(default="", max_length=300)
    system_prompt: str = Field(min_length=1, max_length=4000)
    avatar: str = Field(default="🤖", max_length=8)
    is_public: bool = False
    image_replies: bool = True


class BotOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    description: str
    system_prompt: str | None = None  # hidden from non-owners
    avatar: str
    is_public: bool
    image_replies: bool
    owner_username: str
    is_owner: bool
    created_at: datetime


class MessageIn(BaseModel):
    content: str = Field(min_length=1, max_length=4000)


class MessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    role: str
    content: str
    image_url: str | None
    created_at: datetime


class ConversationCreate(BaseModel):
    bot_id: int


class ConversationOut(BaseModel):
    id: int
    title: str
    bot_id: int
    bot_name: str
    bot_avatar: str
    updated_at: datetime


class ConversationDetail(ConversationOut):
    messages: list[MessageOut]


class ReplyOut(BaseModel):
    user_message: MessageOut
    bot_message: MessageOut
    demo_mode: bool
