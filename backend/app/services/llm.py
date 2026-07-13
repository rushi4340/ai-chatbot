import anthropic
from app.config import get_settings

_client = None


def _get_client():
    global _client
    if _client is None:
        _client = anthropic.Anthropic(api_key=get_settings().anthropic_api_key)
    return _client


SYSTEM_PROMPT = """You are a knowledge base assistant. Answer ONLY using the context provided below.
If the answer is not in the context, respond exactly: "I don't know based on the provided documents."
Do not use outside knowledge. Do not guess or speculate.
For every fact you state, cite the source as [filename — Page X]."""


def generate(question: str, context: str) -> str:
    settings = get_settings()
    client = _get_client()

    msg = client.messages.create(
        model=settings.claude_model,
        max_tokens=settings.max_tokens,
        system=SYSTEM_PROMPT,
        messages=[{
            "role": "user",
            "content": f"Context:\n{context}\n\nQuestion: {question}",
        }],
    )
    return msg.content[0].text
