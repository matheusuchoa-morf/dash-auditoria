'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface CriativoResult {
  id: string
  format: string
  hook: number
  development: number
  cta: number
  total: number
  aiFeedback: string
  recommendations: (string | null)[]
  url?: string
  caption?: string
}

export default function CriativoResultPage() {
  const { id } = useParams<{ id: string }>()
  const [audit, setAudit] = useState<CriativoResult | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem(`criativo-${id}`)
    if (raw) setAudit(JSON.parse(raw))
  }, [id])

  if (!audit) return (
    <div className="p-8 text-center text-aud-text-subtle">Carregando resultado...</div>
  )

  const scoreColor = audit.total >= 70 ? 'text-aud-success' : audit.total >= 50 ? 'text-aud-warning' : 'text-aud-danger'

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Resultado — Criativo</h1>
          <p className="text-aud-text-subtle text-sm capitalize">{audit.format}</p>
        </div>
        <div className={`text-5xl font-bold ${scoreColor}`}>{audit.total}<span className="text-xl text-aud-text-subtle">/100</span></div>
      </div>

      {/* Score breakdown */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Gancho', value: audit.hook, max: 60 },
          { label: 'Desenvolvimento', value: audit.development, max: 30 },
          { label: 'CTA', value: audit.cta, max: 10 },
        ].map(({ label, value, max }) => (
          <div key={label} className="bg-aud-bg-card border border-white/8 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-aud-gold">{value}<span className="text-sm text-aud-text-subtle">/{max}</span></div>
            <div className="text-xs text-aud-text-subtle mt-1">{label}</div>
            <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-aud-gold rounded-full" style={{ width: `${(value / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* AI Feedback */}
      <div className="bg-aud-bg-card border border-white/8 rounded-xl p-6 mb-4">
        <h2 className="text-sm font-semibold text-aud-text-subtle uppercase tracking-wider mb-3">Análise</h2>
        <p className="text-white text-sm leading-relaxed">{audit.aiFeedback}</p>
      </div>

      {/* Recommendations */}
      <div className="bg-aud-bg-card border border-white/8 rounded-xl p-6 mb-8">
        <h2 className="text-sm font-semibold text-aud-text-subtle uppercase tracking-wider mb-3">Recomendações</h2>
        <ul className="space-y-2">
          {audit.recommendations.filter(Boolean).map((rec, i) => (
            <li key={i} className="flex gap-2 text-sm text-white">
              <span className="text-aud-gold mt-0.5">→</span>{rec}
            </li>
          ))}
        </ul>
      </div>

      <Link href="/auditoria/criativo/nova" className="text-aud-gold text-sm hover:underline">← Nova auditoria</Link>
    </div>
  )
}
