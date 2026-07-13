import asyncio
from fastapi import APIRouter, UploadFile, HTTPException
from app.models import UploadResult
from app.config import get_settings
from app.services import pdf_processor, embeddings, vector_store

router = APIRouter()


def _process_pdf(content: bytes, filename: str, settings):
    pages = pdf_processor.extract_pages(content)
    chunks = pdf_processor.chunk_pages(pages, filename, settings.chunk_size, settings.chunk_overlap)
    texts = [c["text"] for c in chunks]
    vecs = embeddings.embed_texts(texts)
    vector_store.add_chunks(chunks, vecs)
    return UploadResult(filename=filename, pages=len(pages), chunks_created=len(chunks))


@router.post("/upload", response_model=list[UploadResult])
async def upload_pdfs(files: list[UploadFile]):
    if not files:
        raise HTTPException(400, "No files provided")

    settings = get_settings()
    results = []

    for file in files:
        if not file.filename or not file.filename.lower().endswith(".pdf"):
            raise HTTPException(400, f"'{file.filename}' is not a PDF file")

        content = await file.read()
        if len(content) == 0:
            raise HTTPException(422, f"'{file.filename}' is empty")

        try:
            result = await asyncio.to_thread(_process_pdf, content, file.filename, settings)
            results.append(result)
        except ValueError as e:
            raise HTTPException(422, f"'{file.filename}': {e}")
        except Exception as e:
            raise HTTPException(422, f"Could not process '{file.filename}': {e}")

    return results

