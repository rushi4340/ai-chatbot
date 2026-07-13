# GPT_Chat — AI-Powered Knowledge Base Q&A

A RAG (Retrieval-Augmented Generation) application that lets you upload PDFs and ask questions about their content. Answers are grounded in your documents with source citations and confidence scoring.

## What It Does

- Upload PDFs → text is extracted, chunked, and embedded into a vector database
- Ask questions → relevant chunks are retrieved and sent to Claude for grounded answers
- Each answer includes cited sources (filename + page number) and a confidence score
- If the answer isn't in your documents, it says so instead of hallucinating

## Prerequisites

- Python 3.10+
- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/)

## Setup

### Backend

```bash
cd GPT-chat/backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

pip install -r requirements.txt

copy .env.example .env       # then edit .env and add your ANTHROPIC_API_KEY
```

### Frontend

```bash
cd GPT-chat/frontend
npm install
```

## Running

Start both servers in separate terminals:

```bash
# Terminal 1: Backend (port 8000)
cd GPT-chat/backend
venv\Scripts\activate
uvicorn app.main:app --reload --port 8000

# Terminal 2: Frontend (port 5173)
cd GPT-chat/frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Usage

1. **Upload** — Drag PDFs into the sidebar upload zone (or click to browse)
2. **Select** — Check the documents you want to query (leave all unchecked = query all)
3. **Ask** — Type a question in the chat input
4. **Review** — Check the confidence badge and expand sources to see which pages were used

## Configuration

All settings are in `backend/.env`:

| Variable | Default | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | (required) | Your Claude API key |
| `EMBEDDING_PROVIDER` | `local` | `local` (sentence-transformers) or `openai` |
| `OPENAI_API_KEY` | — | Required only if `EMBEDDING_PROVIDER=openai` |
| `CHUNK_SIZE` | `500` | Characters per chunk |
| `CHUNK_OVERLAP` | `100` | Overlap between consecutive chunks |
| `TOP_K` | `5` | Number of chunks retrieved per query |
| `SIMILARITY_THRESHOLD` | `0.35` | Minimum similarity to trigger LLM call |

## Troubleshooting

**"sentence-transformers" is slow on first run**
→ It downloads the model (~80MB) once. Subsequent runs are instant.

**CORS errors in the browser**
→ The Vite dev server proxies `/api` to `localhost:8000`. Make sure the backend is running on port 8000.

**"No documents uploaded yet"**
→ Upload at least one PDF before asking questions.

**ChromaDB errors on Windows**
→ Make sure you have SQLite 3.35+. Python 3.11+ ships with a compatible version.

## Demo Script (2-3 minutes)

1. Show the empty UI — sidebar and chat area
2. Upload 2 different PDFs, show them appear in the sidebar with page/chunk counts
3. Select one document, ask a question that's answerable from it → show the answer, confidence badge, and expandable sources
4. Ask something completely unrelated to the documents → show the "I don't know" fallback with Low confidence
5. Delete one document from the sidebar
6. Briefly mention the architecture: upload pipeline (extract → chunk → embed → store) and query pipeline (embed → retrieve → threshold gate → generate)

## Project Structure

```
GPT-chat/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app, CORS, routes
│   │   ├── config.py         # Settings from .env
│   │   ├── models.py         # Pydantic schemas
│   │   ├── routers/          # API endpoints
│   │   └── services/         # PDF processing, embeddings, vector DB, LLM, RAG
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Main layout + state
│   │   ├── api.js            # Backend API client
│   │   └── components/       # UI components
│   ├── package.json
│   └── .env.example
├── README.md
└── ARCHITECTURE.md
```
