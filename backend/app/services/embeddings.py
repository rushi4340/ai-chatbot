import numpy as np
from app.config import get_settings

_model = None


def _get_local_model():
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model


def _embed_local(texts: list[str]) -> list[list[float]]:
    model = _get_local_model()
    vecs = model.encode(texts, normalize_embeddings=True)
    return vecs.tolist()


def _embed_openai(texts: list[str]) -> list[list[float]]:
    import openai
    client = openai.OpenAI(api_key=get_settings().openai_api_key)
    resp = client.embeddings.create(model="text-embedding-3-small", input=texts)
    vecs = [d.embedding for d in resp.data]
    # normalize
    out = []
    for v in vecs:
        arr = np.array(v)
        norm = np.linalg.norm(arr)
        out.append((arr / norm).tolist() if norm > 0 else v)
    return out


def embed_texts(texts: list[str]) -> list[list[float]]:
    if get_settings().embedding_provider == "openai":
        return _embed_openai(texts)
    return _embed_local(texts)


def embed_query(text: str) -> list[float]:
    return embed_texts([text])[0]
