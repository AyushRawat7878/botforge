import os

from dotenv import load_dotenv

load_dotenv()


class Settings:
    secret_key: str = os.getenv("SECRET_KEY", "dev-only-secret-key-change-me-in-backend-env")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./chatbots.db")

    llm_api_key: str = os.getenv("LLM_API_KEY", "").strip()
    llm_base_url: str = os.getenv("LLM_BASE_URL", "https://api.groq.com/openai/v1").rstrip("/")
    llm_model: str = os.getenv("LLM_MODEL", "openai/gpt-oss-120b")
    memory_messages: int = int(os.getenv("MEMORY_MESSAGES", "20"))

    image_base_url: str = os.getenv("IMAGE_BASE_URL", "https://image.pollinations.ai/prompt").rstrip("/")

    frontend_origin: str = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")

    @property
    def demo_mode(self) -> bool:
        return not self.llm_api_key


settings = Settings()
