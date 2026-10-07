from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import Bot, User
from ..schemas import BotIn, BotOut

router = APIRouter(prefix="/api/bots", tags=["bots"])


def to_out(bot: Bot, user: User) -> BotOut:
    is_owner = bot.owner_id == user.id
    return BotOut(
        id=bot.id,
        name=bot.name,
        description=bot.description,
        system_prompt=bot.system_prompt if is_owner else None,
        avatar=bot.avatar,
        is_public=bot.is_public,
        image_replies=bot.image_replies,
        owner_username=bot.owner.username,
        is_owner=is_owner,
        created_at=bot.created_at,
    )


def get_visible_bot(bot_id: int, user: User, db: Session) -> Bot:
    """A bot is visible to its owner, or to everyone if it is public."""
    bot = db.get(Bot, bot_id)
    if not bot or (bot.owner_id != user.id and not bot.is_public):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Bot not found")
    return bot


def get_owned_bot(bot_id: int, user: User, db: Session) -> Bot:
    bot = db.get(Bot, bot_id)
    if not bot or bot.owner_id != user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Bot not found")
    return bot


@router.get("/mine", response_model=list[BotOut])
def my_bots(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    bots = db.scalars(select(Bot).where(Bot.owner_id == user.id).order_by(Bot.created_at.desc()))
    return [to_out(b, user) for b in bots]


@router.get("/public", response_model=list[BotOut])
def public_bots(
    q: str = Query(default="", max_length=60),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    stmt = select(Bot).where(Bot.is_public.is_(True))
    if q:
        like = f"%{q}%"
        stmt = stmt.where(or_(Bot.name.ilike(like), Bot.description.ilike(like)))
    bots = db.scalars(stmt.order_by(Bot.created_at.desc()).limit(100))
    return [to_out(b, user) for b in bots]


@router.post("", response_model=BotOut, status_code=status.HTTP_201_CREATED)
def create_bot(data: BotIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    bot = Bot(owner_id=user.id, **data.model_dump())
    db.add(bot)
    db.commit()
    db.refresh(bot)
    return to_out(bot, user)


@router.get("/{bot_id}", response_model=BotOut)
def get_bot(bot_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return to_out(get_visible_bot(bot_id, user, db), user)


@router.put("/{bot_id}", response_model=BotOut)
def update_bot(
    bot_id: int, data: BotIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    bot = get_owned_bot(bot_id, user, db)
    for key, value in data.model_dump().items():
        setattr(bot, key, value)
    db.commit()
    db.refresh(bot)
    return to_out(bot, user)


@router.delete("/{bot_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_bot(bot_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    bot = get_owned_bot(bot_id, user, db)
    db.delete(bot)
    db.commit()
