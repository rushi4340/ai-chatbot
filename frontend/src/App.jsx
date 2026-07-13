import { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ChatPanel from './components/ChatPanel';
import Toast from './components/Toast';
import * as api from './api';

export default function App() {
  const [docs, setDocs] = useState([]);
  const [activeDocs, setActiveDocs] = useState(new Set());
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0);

  const toast = (msg, type = 'error') => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  };

  const refreshDocs = async () => {
    try {
      const d = await api.getDocuments();
      setDocs(d);
    } catch (e) {
      toast(e.message);
    }
  };

  useEffect(() => { refreshDocs(); }, []);

  const handleUpload = async (files) => {
    try {
      const results = await api.uploadFiles(files);
      toast(`Uploaded ${results.length} file(s)`, 'success');
      refreshDocs();
    } catch (e) {
      toast(e.message);
    }
  };

  const handleDelete = async (filename) => {
    try {
      await api.deleteDocument(filename);
      setActiveDocs((prev) => {
        const next = new Set(prev);
        next.delete(filename);
        return next;
      });
      toast(`Deleted "${filename}"`, 'success');
      refreshDocs();
    } catch (e) {
      toast(e.message);
    }
  };

  const toggleDoc = (filename) => {
    setActiveDocs((prev) => {
      const next = new Set(prev);
      next.has(filename) ? next.delete(filename) : next.add(filename);
      return next;
    });
  };

  const handleAsk = async (question) => {
    setMessages((m) => [...m, { role: 'user', content: question }]);
    setLoading(true);
    try {
      const active = [...activeDocs];
      const res = await api.askQuestion(question, active);
      setMessages((m) => [...m, { role: 'assistant', ...res }]);
    } catch (e) {
      toast(e.message);
      setMessages((m) => [...m, {
        role: 'assistant',
        answer: 'Something went wrong. Please try again.',
        sources: [], overall_confidence: 0, confidence_level: 'Low',
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        docs={docs}
        activeDocs={activeDocs}
        onUpload={handleUpload}
        onDelete={handleDelete}
        onToggle={toggleDoc}
      />
      <ChatPanel
        messages={messages}
        loading={loading}
        onSend={handleAsk}
        hasDocs={docs.length > 0}
      />
      <div className="fixed top-4 right-4 flex flex-col gap-2 z-50">
        {toasts.map((t) => (
          <Toast key={t.id} message={t.msg} type={t.type} />
        ))}
      </div>
    </div>
  );
}
