import UploadZone from './UploadZone';
import DocumentList from './DocumentList';

export default function Sidebar({ docs, activeDocs, onUpload, onDelete, onToggle }) {
  return (
    <aside className="w-80 shrink-0 bg-slate-950 border-r border-slate-800 flex flex-col h-full">
      <div className="p-4 border-b border-slate-800">
        <h1 className="text-lg font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          GPT Chat
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">AI-powered document Q&A</p>
      </div>

      <div className="p-4">
        <UploadZone onUpload={onUpload} />
      </div>

      <div className="px-4 pb-2">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Documents</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <DocumentList docs={docs} activeDocs={activeDocs} onToggle={onToggle} onDelete={onDelete} />
      </div>

      <div className="p-4 border-t border-slate-800 text-xs text-slate-600">
        {activeDocs.size > 0
          ? `${activeDocs.size} doc(s) selected for queries`
          : 'All docs active (none selected)'}
      </div>
    </aside>
  );
}
