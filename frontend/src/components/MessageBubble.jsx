import { useState } from 'react';
import ConfidenceBadge from './ConfidenceBadge';
import SourceCard from './SourceCard';

export default function MessageBubble({ message }) {
  const [showSources, setShowSources] = useState(false);
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="msg-enter flex justify-end">
        <div className="max-w-[70%] bg-indigo-600 text-white px-4 py-3 rounded-2xl rounded-br-md shadow-md">
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>
      </div>
    );
  }

  const hasSources = message.sources?.length > 0;

  return (
    <div className="msg-enter flex justify-start">
      <div className="max-w-[75%] bg-slate-800 border border-slate-700/50 px-4 py-3 rounded-2xl rounded-bl-md shadow-md">
        <p className="text-sm leading-relaxed text-slate-200 whitespace-pre-wrap">{message.answer}</p>

        <div className="flex items-center gap-2 mt-3">
          <ConfidenceBadge level={message.confidence_level} score={message.overall_confidence} />
          {hasSources && (
            <button
              onClick={() => setShowSources(!showSources)}
              className="text-xs text-slate-400 hover:text-indigo-400 transition-colors"
            >
              {showSources ? 'Hide' : 'Show'} sources ({message.sources.length})
            </button>
          )}
        </div>

        {showSources && hasSources && (
          <div className="mt-3 flex flex-col gap-2">
            {message.sources.map((s, i) => (
              <SourceCard key={i} source={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
