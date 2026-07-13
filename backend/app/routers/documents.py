from fastapi import APIRouter, HTTPException
from app.models import DocumentInfo
from app.services import vector_store

router = APIRouter()


@router.get("/documents", response_model=list[DocumentInfo])
async def list_docs():
    docs = vector_store.list_documents()
    return [DocumentInfo(**d) for d in docs]


@router.delete("/documents/{filename}")
async def delete_doc(filename: str):
    removed = vector_store.delete_document(filename)
    if removed == 0:
        raise HTTPException(404, f"Document '{filename}' not found")
    return {"message": f"Deleted {removed} chunks from '{filename}'"}
