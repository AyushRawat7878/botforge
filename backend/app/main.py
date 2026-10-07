from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import Base, engine
from .routers import auth, bots, chats

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Chatbot Platform", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin, "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(bots.router)
app.include_router(chats.router)


@app.get("/api/health")
def health():
    return {"status": "ok", "demo_mode": settings.demo_mode, "model": settings.llm_model}
