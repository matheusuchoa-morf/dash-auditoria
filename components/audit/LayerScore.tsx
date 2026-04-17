interface LayerScoreProps {
  label: string
  score: number
  maxScore: number
  feedback: string
  expanded?: boolean
}

export function LayerScore({ label, score, maxScore, feedback, expanded = false }: LayerScoreProps) {
  const pct = Math.round((score / maxScore) * 100)
  const color = pct >= 70 ? 'bg-aud-success' : pct >= 40 ? 'bg-aud-warning' : 'bg-aud-danger'

  return (
    <div className="bg-aud-bg-card border border-white/8 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-white font-medium">{label}</span>
        <span className="text-aud-gold font-bold text-lg">{score}<span className="text-aud-text-subtle text-sm font-normal">/{maxScore}</span></span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-3">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      {expanded && <p className="text-aud-text-subtle text-sm">{feedback}</p>}
    </div>
  )
}
