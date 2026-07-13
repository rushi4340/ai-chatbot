# Architecture

## RAG Pipeline Overview

There are two main flows: **ingestion** (upload) and **retrieval** (query).

### Ingestion Flow

```
PDF Upload
    │
    ▼
Extract text (PyMuPDF, page-by-page)
    │
    ▼
Chunk text (500 chars, 100 overlap, preserving page metadata)
    │
    ▼
Generate embeddings (sentence-transformers or OpenAI)
    │
    ▼
Store in ChromaDB (chunks + vectors + metadata)
```

### Query Flow

```
User question
    │
    ▼
Embed the question (same model as ingestion)
    │
    ▼
Retrieve top-5 chunks from ChromaDB (cosine similarity)
    │
    ▼
Confidence gate: best similarity < 0.35?
    │          │
    YES        NO
    │          │
    ▼          ▼
"I don't    Build context from chunks
 know"      + strict RAG prompt
            │
            ▼
        Call Claude API
            │
            ▼
        Return answer + sources + confidence
```

## Design Decisions

### Why this chunking strategy?

- **500 characters with 100 overlap**: Small enough to be semantically focused, large enough to carry context. The overlap prevents information loss at chunk boundaries.
- **Page-level extraction first**: Preserves page number metadata so we can cite exact pages in the response.
- **Character-based splitting**: Simpler and more predictable than token-based splitting. For English text, 500 chars ≈ 100 tokens, which fits well within embedding model context windows.

### Why ChromaDB?

- Embedded (no separate server process to manage)
- Persistent to disk (survives restarts)
- Built-in cosine distance support
- Good enough for single-user / demo scale
- Zero config — just point it at a directory

### Why sentence-transformers (all-MiniLM-L6-v2)?

- Free, runs locally, no API key needed
- 384-dimensional embeddings (fast to compute and store)
- Good quality for semantic similarity tasks
- ~80MB model download on first use

## Hallucination Prevention

This is a multi-layered approach:

1. **Strict system prompt**: Claude is explicitly told to answer only from the provided context, never use outside knowledge, and say "I don't know" when the answer isn't in the context.

2. **Similarity threshold gate**: If the best retrieved chunk has a cosine similarity below 0.35 to the query, we skip the LLM call entirely and return "I don't know" directly. This prevents the LLM from receiving irrelevant context and being tempted to hallucinate.

3. **Source-grounded context**: The LLM only sees the retrieved chunks, labeled with their source filename and page number. It's instructed to cite sources for every fact.

4. **Confidence scoring**: The response includes a confidence score derived from retrieval similarity (not LLM self-assessment), giving users a quantitative signal of answer reliability.

## Confidence Scoring

- **Source**: Derived from ChromaDB's cosine distance between query and retrieved chunks
- **Conversion**: `similarity = 1 - cosine_distance` (since ChromaDB returns distance, not similarity)
- **Per-source score**: Each cited source gets its own similarity percentage
- **Overall score**: Average of all retrieved chunk similarities
- **Levels**: High (≥65%), Medium (35-65%), Low (<35%)

## Known Limitations

- No streaming responses — the full answer is returned at once
- Single-user design — no auth or session isolation
- Character-based chunking doesn't respect sentence or paragraph boundaries
- No re-ranking step — relies purely on embedding similarity
- Large PDFs with many pages will take a while to process (sequential embedding)
- Only handles PDF format

## Future Improvements

- **Streaming responses** via SSE for better UX on long answers
- **Hybrid search** combining vector similarity with BM25 keyword matching
- **Cross-encoder re-ranking** to improve retrieval precision
- **Semantic chunking** that splits on paragraph or topic boundaries
- **Multi-format support** (DOCX, TXT, HTML)
- **Conversation memory** for follow-up questions with context
- **Batch embedding** with progress tracking for large uploads
