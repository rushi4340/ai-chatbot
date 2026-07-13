import fitz


def extract_pages(pdf_bytes: bytes) -> list[dict]:
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    if doc.page_count == 0:
        raise ValueError("PDF has no pages")

    pages = []
    for i, page in enumerate(doc):
        text = page.get_text().strip()
        if text:
            pages.append({"page": i + 1, "text": text})
    doc.close()

    if not pages:
        raise ValueError("PDF contains no readable text")
    return pages


def chunk_pages(pages: list[dict], filename: str, size=500, overlap=100) -> list[dict]:
    chunks = []
    idx = 0

    for page in pages:
        text = page["text"]
        start = 0
        while start < len(text):
            end = start + size
            chunk_text = text[start:end].strip()
            if chunk_text:
                chunks.append({
                    "text": chunk_text,
                    "filename": filename,
                    "page": page["page"],
                    "chunk_index": idx,
                })
                idx += 1
            start += size - overlap

    return chunks
