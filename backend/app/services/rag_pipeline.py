from app.config import get_settings
from app.services import embeddings, vector_store, llm
from app.models import AskResponse, Source

NO_ANSWER = "I don't know based on the provided documents."


def _distance_to_similarity(distance: float) -> float:
    # chromadb cosine space returns distance in [0, 2], similarity = 1 - distance
    return max(0.0, min(1.0, 1.0 - distance))


def _confidence_level(score: float) -> str:
    settings = get_settings()
    if score >= settings.high_confidence:
        return "High"
    if score >= settings.similarity_threshold:
        return "Medium"
    return "Low"


def ask(question: str, active_docs: list[str] | None = None) -> AskResponse:
    settings = get_settings()

    query_vec = embeddings.embed_query(question)

    results = vector_store.query(
        embedding=query_vec,
        top_k=settings.top_k,
        filenames=active_docs if active_docs else None,
    )

    distances = results["distances"][0] if results["distances"] else []
    docs = results["documents"][0] if results["documents"] else []
    metas = results["metadatas"][0] if results["metadatas"] else []

    if not distances:
        return AskResponse(
            answer=NO_ANSWER,
            sources=[],
            overall_confidence=0.0,
            confidence_level="Low",
        )

    similarities = [_distance_to_similarity(d) for d in distances]
    best_sim = max(similarities)

    # gate: if best match is too weak, skip the LLM
    if best_sim < settings.similarity_threshold:
        return AskResponse(
            answer=NO_ANSWER,
            sources=[],
            overall_confidence=round(best_sim * 100, 1),
            confidence_level="Low",
        )

    # build context for the prompt
    context_parts = []
    sources = []
    for i, (doc, meta, sim) in enumerate(zip(docs, metas, similarities)):
        label = f"[{meta['filename']} — Page {meta['page']}]"
        context_parts.append(f"{label}\n{doc}")
        snippet = doc[:150].replace("\n", " ").strip()
        sources.append(Source(
            filename=meta["filename"],
            page=meta["page"],
            snippet=snippet + "..." if len(doc) > 150 else snippet,
            confidence_score=round(sim * 100, 1),
        ))

    context = "\n\n---\n\n".join(context_parts)

    try:
        answer = llm.generate(question, context)
    except Exception as e:
        raise RuntimeError(f"LLM call failed: {e}")

    avg_confidence = sum(similarities) / len(similarities)

    return AskResponse(
        answer=answer,
        sources=sources,
        overall_confidence=round(avg_confidence * 100, 1),
        confidence_level=_confidence_level(avg_confidence),
    )
