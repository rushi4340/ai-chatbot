export default function DocumentList({ docs, activeDocs, onToggle, onDelete }) {
  if (!docs.length) {
    return (
      <div className="text-center py-8 text-slate-500">
        <p className="text-sm">No documents yet</p>
        <p className="text-xs mt-1">Upload a PDF to get started</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      {docs.map((doc) => {
        const active = activeDocs.has(doc.filename);
        return (
          <div
            key={doc.filename}
            className={`flex items-center gap-2 p-2.5 rounded-lg transition-colors group
              ${active ? 'bg-indigo-500/10 border border-indigo-500/20' : 'bg-slate-800/50 border border-transparent hover:bg-slate-800'}`}
          >
            <input
              type="checkbox"
              checked={active}
              onChange={() => onToggle(doc.filename)}
              className="rounded accent-indigo-500 w-4 h-4 shrink-0 cursor-pointer"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-200 truncate">{doc.filename}</p>
              <p className="text-xs text-slate-500">{doc.page_count} pages · {doc.chunk_count} chunks</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(doc.filename); }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-all shrink-0"
              title="Delete"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
