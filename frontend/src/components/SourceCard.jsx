import { useState } from 'react';

export default function SourceCard({ source }) {
  return (
    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-indigo-400">
          {source.filename} — Page {source.page}
        </span>
        <span className="text-xs text-slate-400">{source.confidence_score}%</span>
      </div>
      <p className="text-xs text-slate-300 leading-relaxed">{source.snippet}</p>
    </div>
  );
}
