export default function ConfidenceBadge({ level, score }) {
  const colors = {
    High: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    Medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    Low: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${colors[level] || colors.Low}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {level} ({score}%)
    </span>
  );
}
