import { db } from '@/lib/db'
import { TierBadge } from '@/components/audit/TierBadge'
import { calcOverallScore } from '@/types/audit'

export default async function HomePage() {
  const audits = await db.getInstagramAudits('user-student-1') // TODO: real userId from session

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Bem-vindo de volta</h1>
      <p className="text-aud-text-subtle mb-8">Suas últimas auditorias</p>

      {audits.length === 0 ? (
        <div className="bg-aud-bg-card border border-white/8 rounded-xl p-8 text-center">
          <p className="text-aud-text-subtle mb-4">Nenhuma auditoria ainda</p>
          <a href="/auditoria/instagram/nova" className="text-aud-gold hover:underline text-sm">
            Iniciar primeira auditoria →
          </a>
        </div>
      ) : (
        <div className="grid gap-4">
          {audits.map(audit => (
            <a
              key={audit.id}
              href={`/auditoria/instagram/${audit.id}`}
              className="bg-aud-bg-card border border-white/8 rounded-xl p-5 flex items-center justify-between hover:border-aud-gold/30 transition-colors"
            >
              <div>
                <p className="font-medium text-white">@{audit.instagramHandle}</p>
                <p className="text-aud-text-subtle text-sm mt-0.5">
                  {audit.createdAt.toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-aud-gold">{calcOverallScore(audit.layers)}</span>
                <TierBadge tier={audit.tier} />
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
