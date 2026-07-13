const BASE = '/api';

async function request(url, options = {}) {
  const res = await fetch(BASE + url, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed (${res.status})`);
  }
  return res.json();
}

export function uploadFiles(files) {
  const form = new FormData();
  files.forEach((f) => form.append('files', f));
  return request('/upload', { method: 'POST', body: form });
}

export function askQuestion(question, activeDocs) {
  return request('/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question,
      active_documents: activeDocs?.length ? activeDocs : null,
    }),
  });
}

export function getDocuments() {
  return request('/documents');
}

export function deleteDocument(filename) {
  return request(`/documents/${encodeURIComponent(filename)}`, { method: 'DELETE' });
}
