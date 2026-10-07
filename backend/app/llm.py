"""Talks to the language model and turns its answer into text + optional image."""

import random
import re
from dataclasses import dataclass
from urllib.parse import quote

import httpx

from .config import settings
from .models import Bot, Message

IMAGE_TAG = re.compile(r"\[IMAGE:\s*(.+?)\]", re.IGNORECASE | re.DOTALL)

IMAGE_INSTRUCTIONS = (
    "\n\nYou can also reply with a picture. When the user asks for an image, drawing, photo "
    "or picture, or when an image would clearly help, add ONE line in this exact format "
    "anywhere in your reply:\n[IMAGE: a detailed description of the picture to generate]\n"
    "Write the description in English, describe the subject, style, colours and setting. "
    "Do not mention this format to the user and never use it more than once per reply."
)

NO_IMAGE_INSTRUCTIONS = (
    "\n\nYou can only reply with text. If the user asks for an image, explain politely that "
    "you can't create images."
)


@dataclass
class BotReply:
    text: str
    image_url: str | None


class LLMError(Exception):
    pass


def build_image_url(prompt: str) -> str:
    seed = random.randint(1, 1_000_000)
    return f"{settings.image_base_url}/{quote(prompt.strip())}?width=768&height=768&nologo=true&seed={seed}"


def build_messages(bot: Bot, history: list[Message]) -> list[dict]:
    """System prompt + the last N messages: this is the bot's memory of the conversation."""
    system = bot.system_prompt.strip() + (IMAGE_INSTRUCTIONS if bot.image_replies else NO_IMAGE_INSTRUCTIONS)
    messages = [{"role": "system", "content": system}]
    for m in history[-settings.memory_messages:]:
        content = m.content
        if m.role == "assistant" and m.image_url:
            content = (content + "\n(You also sent the user an image in this reply.)").strip()
        messages.append({"role": m.role, "content": content})
    return messages


def parse_reply(raw: str, allow_images: bool) -> BotReply:
    match = IMAGE_TAG.search(raw)
    image_url = None
    if match and allow_images:
        image_url = build_image_url(match.group(1))
    text = IMAGE_TAG.sub("", raw).strip()
    if not text and image_url:
        text = "Here you go!"
    return BotReply(text=text, image_url=image_url)


def demo_reply(bot: Bot, history: list[Message]) -> str:
    """Used when no API key is set, so the app can be tried without any account."""
    last = history[-1].content if history else ""
    turns = sum(1 for m in history if m.role == "user")
    wants_image = re.search(r"\b(image|picture|photo|draw|drawing|sketch|paint)\b", last, re.I)
    if wants_image and bot.image_replies:
        return f"(Demo mode) Here's a picture for you!\n[IMAGE: {last}]"
    first = next((m.content for m in history if m.role == "user"), "")
    memory = f' You first said: "{first[:60]}".' if turns > 1 else ""
    return (
        f"(Demo mode) I'm {bot.name}. You said: \"{last[:200]}\". This is message #{turns} "
        f"in our chat.{memory} Add an LLM_API_KEY in backend/.env to get real answers."
    )


async def generate_reply(bot: Bot, history: list[Message]) -> BotReply:
    if settings.demo_mode:
        return parse_reply(demo_reply(bot, history), bot.image_replies)

    payload = {
        "model": settings.llm_model,
        "messages": build_messages(bot, history),
        "temperature": 0.7,
    }
    headers = {"Authorization": f"Bearer {settings.llm_api_key}"}
    try:
        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(f"{settings.llm_base_url}/chat/completions", json=payload, headers=headers)
    except httpx.HTTPError as exc:
        raise LLMError(f"Could not reach the LLM API: {exc}") from exc
    if resp.status_code != 200:
        raise LLMError(f"LLM API returned {resp.status_code}: {resp.text[:300]}")
    try:
        raw = resp.json()["choices"][0]["message"]["content"] or ""
    except (KeyError, IndexError, ValueError) as exc:
        raise LLMError("Unexpected response from the LLM API") from exc
    return parse_reply(raw, bot.image_replies)
