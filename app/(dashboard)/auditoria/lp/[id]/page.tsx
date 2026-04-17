import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'

export default async function AuditoriaLPResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const audit = await db.getLPAudit(id)
  if (!audit) notFound()

  // Authorization: verify audit belongs to current user
  const cookieStore = await cookies()
  const userId = cookieStore.get('mock_user_id')?.value
  if (audit.userId !== userId) notFound()

  const scoreColor = audit.croScore >= 70 ? 'text-aud-success' : audit.croScore >= 40 ? 'text-aud-warning' : 'text-aud-danger'

  return (
    <div className="max-w-3xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Auditoria CRO</h1>
          <p className="text-aud-text-subtle text-sm mt-1 break-all">{audit.pageUrl}</p>
        </div>
        <p className={`text-5xl font-bold ${scoreColor}`}>{audit.croScore}</p>
      </div>

      {audit.aiSummary && (
        <div className="bg-aud-bg-card border border-aud-gold/20 rounded-xl p-5 mb-6">
          <p className="text-aud-text-subtle text-sm leading-relaxed">{audit.aiSummary}</p>
        </div>
      )}

      {audit.recommendations.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-3">Top Recomendações</h2>
          <ol className="space-y-2">
            {audit.recommendations.map((rec, i) => (
              <li key={i} className="flex gap-3 text-sm text-aud-text-subtle">
                <span className="text-aud-gold font-bold shrink-0">{i + 1}.</span>
                {rec}
              </li>
            ))}
          </ol>
        </div>
      )}

      {audit.findings.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">Findings Detalhados</h2>
          <div className="space-y-3">
            {audit.findings.map((f, i) => {
              const impactColor = f.impact === 'alto' ? 'text-aud-danger' : f.impact === 'medio' ? 'text-aud-warning' : 'text-aud-success'
              return (
                <div key={i} className="bg-aud-bg-card border border-white/8 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium text-sm">{f.section}</span>
                    <span className={`text-xs font-semibold uppercase ${impactColor}`}>{f.impact}</span>
                  </div>
                  <p className="text-aud-danger text-sm mb-2">{f.issue}</p>
                  <p className="text-aud-text-subtle text-sm">{f.recommendation}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
