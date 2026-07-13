from fastapi import APIRouter, HTTPException
from app.models import AskRequest, AskResponse
from app.services import rag_pipeline, vector_store

router = APIRouter()


@router.post("/ask", response_model=AskResponse)
async def ask_question(req: AskRequest):
    if not req.question.strip():
        raise HTTPException(400, "Question cannot be empty")

    docs = vector_store.list_documents()
    if not docs:
        raise HTTPException(404, "No documents uploaded yet. Upload a PDF first.")

    if req.active_documents:
        available = {d["filename"] for d in docs}
        missing = [f for f in req.active_documents if f not in available]
        if missing:
            raise HTTPException(404, f"Documents not found: {', '.join(missing)}")

    try:
        return rag_pipeline.ask(req.question, req.active_documents)
    except RuntimeError as e:
        raise HTTPException(503, str(e))
    except Exception as e:
        raise HTTPException(500, f"Unexpected error: {e}")
