from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    anthropic_api_key: str = ""
    openai_api_key: str = ""
    embedding_provider: str = "local"  # "local" or "openai"
    chroma_persist_dir: str = "./chroma_data"
    chunk_size: int = 500
    chunk_overlap: int = 100
    top_k: int = 5
    similarity_threshold: float = 0.35
    high_confidence: float = 0.65
    claude_model: str = "claude-sonnet-4-6"
    max_tokens: int = 2048

    class Config:
        env_file = ".env"


@lru_cache
def get_settings():
    return Settings()
