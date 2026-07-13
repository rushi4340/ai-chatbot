from pydantic import BaseModel


class UploadResult(BaseModel):
    filename: str
    pages: int
    chunks_created: int


class Source(BaseModel):
    filename: str
    page: int
    snippet: str
    confidence_score: float


class AskRequest(BaseModel):
    question: str
    active_documents: list[str] | None = None


class AskResponse(BaseModel):
    answer: str
    sources: list[Source]
    overall_confidence: float
    confidence_level: str


class DocumentInfo(BaseModel):
    filename: str
    page_count: int
    chunk_count: int
