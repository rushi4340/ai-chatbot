from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import upload, ask, documents

app = FastAPI(title="GPT Chat API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, tags=["Upload"])
app.include_router(ask.router, tags=["Ask"])
app.include_router(documents.router, tags=["Documents"])


@app.get("/health")
async def health():
    return {"status": "ok"}
