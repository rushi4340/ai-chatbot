import { useState } from 'react';

export default function Toast({ message, type }) {
  const [exiting, setExiting] = useState(false);

  const bg = type === 'success'
    ? 'bg-emerald-500/90'
    : 'bg-red-500/90';

  return (
    <div
      className={`${bg} ${exiting ? 'toast-exit' : 'toast-enter'} text-white px-4 py-3 rounded-lg shadow-lg text-sm max-w-xs backdrop-blur-sm cursor-pointer`}
      onClick={() => setExiting(true)}
    >
      {message}
    </div>
  );
}
