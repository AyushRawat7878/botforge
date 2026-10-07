import os
import sys
from pathlib import Path

# Use a throwaway database and demo mode for tests.
os.environ["DATABASE_URL"] = "sqlite:///./test_chatbots.db"
os.environ["LLM_API_KEY"] = ""
Path("test_chatbots.db").unlink(missing_ok=True)
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi.testclient import TestClient  # noqa: E402

from app.llm import parse_reply  # noqa: E402
from app.main import app  # noqa: E402

client = TestClient(app)


def register(name: str) -> dict:
    r = client.post("/api/auth/register", json={"username": name, "email": f"{name}@test.com", "password": "secret123"})
    assert r.status_code == 201, r.text
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


alice = register("alice")
bob = register("bob")


def make_bot(headers, **extra):
    body = {"name": "Chef", "description": "Cooks", "system_prompt": "You are a chef.", "avatar": "👨‍🍳"} | extra
    r = client.post("/api/bots", json=body, headers=headers)
    assert r.status_code == 201, r.text
    return r.json()


def test_auth_rules():
    assert client.get("/api/bots/mine").status_code == 401
    assert client.post("/api/auth/register", json={"username": "alice", "email": "x@test.com", "password": "secret123"}).status_code == 409
    assert client.post("/api/auth/login", json={"username": "alice", "password": "wrong"}).status_code == 401
    r = client.post("/api/auth/login", json={"username": "alice@test.com", "password": "secret123"})
    assert r.status_code == 200 and r.json()["user"]["username"] == "alice"


def test_private_bot_hidden_from_others():
    bot = make_bot(alice, is_public=False)
    assert client.get(f"/api/bots/{bot['id']}", headers=bob).status_code == 404
    assert client.post("/api/conversations", json={"bot_id": bot["id"]}, headers=bob).status_code == 404
    assert bot["id"] not in [b["id"] for b in client.get("/api/bots/public", headers=bob).json()]


def test_public_bot_visible_but_prompt_hidden():
    bot = make_bot(alice, name="Poet", is_public=True)
    r = client.get(f"/api/bots/{bot['id']}", headers=bob)
    assert r.status_code == 200 and r.json()["system_prompt"] is None and not r.json()["is_owner"]
    found = client.get("/api/bots/public?q=poe", headers=bob).json()
    assert any(b["id"] == bot["id"] for b in found)
    # Bob cannot edit or delete Alice's bot.
    assert client.delete(f"/api/bots/{bot['id']}", headers=bob).status_code == 404


def test_chat_memory_and_images():
    bot = make_bot(alice, is_public=True)
    conv = client.post("/api/conversations", json={"bot_id": bot["id"]}, headers=bob).json()
    r1 = client.post(f"/api/conversations/{conv['id']}/messages", json={"content": "My name is Bob"}, headers=bob)
    assert r1.status_code == 200 and r1.json()["demo_mode"]
    r2 = client.post(f"/api/conversations/{conv['id']}/messages", json={"content": "What did I say first?"}, headers=bob)
    assert "My name is Bob" in r2.json()["bot_message"]["content"]  # demo bot recalls history
    r3 = client.post(f"/api/conversations/{conv['id']}/messages", json={"content": "draw a cat"}, headers=bob)
    assert r3.json()["bot_message"]["image_url"].startswith("https://image.pollinations.ai/prompt/draw%20a%20cat")
    detail = client.get(f"/api/conversations/{conv['id']}", headers=bob).json()
    assert len(detail["messages"]) == 6 and detail["title"] == "My name is Bob"
    # Alice can't read Bob's conversation.
    assert client.get(f"/api/conversations/{conv['id']}", headers=alice).status_code == 404
    # If Alice makes the bot private, Bob can no longer chat with it.
    client.put(f"/api/bots/{bot['id']}", json={**{k: bot[k] for k in ("name", "description", "avatar", "image_replies")},
                                              "system_prompt": "x", "is_public": False}, headers=alice)
    assert client.post(f"/api/conversations/{conv['id']}/messages", json={"content": "hi"}, headers=bob).status_code == 404


def test_parse_reply():
    r = parse_reply("Sure!\n[IMAGE: a red fox in snow]", allow_images=True)
    assert r.text == "Sure!" and "a%20red%20fox%20in%20snow" in r.image_url
    r = parse_reply("[IMAGE: a fox]", allow_images=False)
    assert r.image_url is None
