import { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';

function TypingIndicator() {
  return (
    <div className="flex justify-start msg-enter">
      <div className="bg-slate-800 border border-slate-700/50 px-5 py-3 rounded-2xl rounded-bl-md shadow-md">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 rounded-full bg-slate-400 pulse-dot" />
          <span className="w-2 h-2 rounded-full bg-slate-400 pulse-dot" />
          <span className="w-2 h-2 rounded-full bg-slate-400 pulse-dot" />
        </div>
      </div>
    </div>
  );
}

export default function ChatPanel({ messages, loading, onSend, hasDocs }) {
  const [input, setInput] = useState('');
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const submit = (e) => {
    e.preventDefault();
    const q = input.trim();
    if (!q || loading) return;
    setInput('');
    onSend(q);
  };

  return (
    <main className="flex-1 flex flex-col h-full bg-slate-900">
      <div className="flex-1 overflow-y-auto p-6">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-slate-200 mb-2">Ask your documents</h2>
              <p className="text-sm text-slate-500 max-w-md">
                {hasDocs
                  ? 'Select documents in the sidebar and ask a question below.'
                  : 'Upload a PDF in the sidebar to get started.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto flex flex-col gap-4">
            {messages.map((m, i) => (
              <MessageBubble key={i} message={m} />
            ))}
            {loading && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="border-t border-slate-800 p-4">
        <form onSubmit={submit} className="max-w-3xl mx-auto flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={hasDocs ? 'Ask a question about your documents...' : 'Upload a PDF first...'}
            disabled={!hasDocs || loading}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 disabled:opacity-50 transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading || !hasDocs}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white px-5 py-3 rounded-xl text-sm font-medium transition-colors shrink-0"
          >
            Send
          </button>
        </form>
      </div>
    </main>
  );
}
