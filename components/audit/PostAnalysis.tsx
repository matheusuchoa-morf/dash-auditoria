import type { PostAnalysis as PostAnalysisType } from '@/types/audit'

export function PostAnalysis({ post }: { post: PostAnalysisType }) {
  return (
    <div className="bg-aud-bg-card border border-white/8 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-aud-text-subtle text-xs uppercase tracking-wide">{post.format}</span>
        <span className="text-aud-gold font-bold">{post.total}/100</span>
      </div>
      <div className="space-y-2 mb-4">
        <ScoreBar label="Gancho" score={post.hook} max={60} />
        <ScoreBar label="Desenvolvimento" score={post.development} max={30} />
        <ScoreBar label="CTA" score={post.cta} max={10} />
      </div>
      <p className="text-aud-text-subtle text-sm">{post.aiFeedback}</p>
    </div>
  )
}

function ScoreBar({ label, score, max }: { label: string; score: number; max: number }) {
  const pct = Math.round((score / max) * 100)
  const color = pct >= 70 ? 'bg-aud-success' : pct >= 40 ? 'bg-aud-warning' : 'bg-aud-danger'
  return (
    <div className="flex items-center gap-3">
      <span className="text-aud-text-subtle text-xs w-28 shrink-0">{label} ({score}/{max})</span>
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
