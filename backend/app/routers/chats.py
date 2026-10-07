from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..config import settings
from ..database import get_db
from ..llm import LLMError, generate_reply
from ..models import Conversation, Message, User, utcnow
from ..schemas import (
    ConversationCreate,
    ConversationDetail,
    ConversationOut,
    MessageIn,
    MessageOut,
    ReplyOut,
)
from .bots import get_visible_bot

router = APIRouter(prefix="/api/conversations", tags=["conversations"])


def to_out(c: Conversation) -> ConversationOut:
    return ConversationOut(
        id=c.id,
        title=c.title,
        bot_id=c.bot_id,
        bot_name=c.bot.name,
        bot_avatar=c.bot.avatar,
        updated_at=c.updated_at,
    )


def get_own_conversation(conv_id: int, user: User, db: Session) -> Conversation:
    conv = db.get(Conversation, conv_id)
    if not conv or conv.user_id != user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Conversation not found")
    return conv


@router.get("", response_model=list[ConversationOut])
def list_conversations(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    convs = db.scalars(
        select(Conversation).where(Conversation.user_id == user.id).order_by(Conversation.updated_at.desc())
    )
    return [to_out(c) for c in convs]


@router.post("", response_model=ConversationOut, status_code=status.HTTP_201_CREATED)
def start_conversation(
    data: ConversationCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    bot = get_visible_bot(data.bot_id, user, db)
    conv = Conversation(user_id=user.id, bot_id=bot.id)
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return to_out(conv)


@router.get("/{conv_id}", response_model=ConversationDetail)
def get_conversation(conv_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    conv = get_own_conversation(conv_id, user, db)
    return ConversationDetail(
        **to_out(conv).model_dump(),
        messages=[MessageOut.model_validate(m) for m in conv.messages],
    )


@router.delete("/{conv_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_conversation(conv_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    conv = get_own_conversation(conv_id, user, db)
    db.delete(conv)
    db.commit()


@router.post("/{conv_id}/messages", response_model=ReplyOut)
async def send_message(
    conv_id: int, data: MessageIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    conv = get_own_conversation(conv_id, user, db)
    # The bot may have been made private or deleted since the chat started.
    bot = get_visible_bot(conv.bot_id, user, db)

    user_msg = Message(role="user", content=data.content.strip())
    conv.messages.append(user_msg)
    if conv.title == "New chat":
        conv.title = data.content.strip()[:60]
    db.flush()

    history = list(conv.messages)
    try:
        reply = await generate_reply(bot, history)
    except LLMError as exc:
        db.rollback()
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, str(exc))

    bot_msg = Message(role="assistant", content=reply.text, image_url=reply.image_url)
    conv.messages.append(bot_msg)
    conv.updated_at = utcnow()
    db.commit()
    db.refresh(user_msg)
    db.refresh(bot_msg)
    return ReplyOut(
        user_message=MessageOut.model_validate(user_msg),
        bot_message=MessageOut.model_validate(bot_msg),
        demo_mode=settings.demo_mode,
    )
