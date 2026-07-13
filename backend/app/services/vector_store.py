import chromadb
from app.config import get_settings

_client = None
_collection = None

COLLECTION_NAME = "gpt_documents"


def _get_collection():
    global _client, _collection
    if _collection is None:
        settings = get_settings()
        _client = chromadb.PersistentClient(path=settings.chroma_persist_dir)
        _collection = _client.get_or_create_collection(
            name=COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"},
        )
    return _collection


def add_chunks(chunks: list[dict], embeddings: list[list[float]]):
    col = _get_collection()
    ids = [f"{c['filename']}__chunk_{c['chunk_index']}" for c in chunks]
    documents = [c["text"] for c in chunks]
    metadatas = [{"filename": c["filename"], "page": c["page"], "chunk_index": c["chunk_index"]} for c in chunks]
    col.upsert(ids=ids, documents=documents, embeddings=embeddings, metadatas=metadatas)


def query(embedding: list[float], top_k: int = 5, filenames: list[str] | None = None):
    col = _get_collection()
    where = {"filename": {"$in": filenames}} if filenames else None
    results = col.query(
        query_embeddings=[embedding],
        n_results=top_k,
        where=where,
        include=["documents", "metadatas", "distances"],
    )
    return results


def list_documents() -> list[dict]:
    col = _get_collection()
    all_meta = col.get(include=["metadatas"])
    if not all_meta["metadatas"]:
        return []

    docs = {}
    for m in all_meta["metadatas"]:
        fn = m["filename"]
        if fn not in docs:
            docs[fn] = {"filename": fn, "pages": set(), "chunks": 0}
        docs[fn]["pages"].add(m["page"])
        docs[fn]["chunks"] += 1

    return [
        {"filename": fn, "page_count": len(d["pages"]), "chunk_count": d["chunks"]}
        for fn, d in docs.items()
    ]


def delete_document(filename: str) -> int:
    col = _get_collection()
    existing = col.get(where={"filename": filename})
    if not existing["ids"]:
        return 0
    col.delete(ids=existing["ids"])
    return len(existing["ids"])
