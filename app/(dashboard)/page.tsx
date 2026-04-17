import { db } from '@/lib/db'
import { TierBadge } from '@/components/audit/TierBadge'
import { cookies } from 'next/headers'
import Link from 'next/link'

export default async function HomePage() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('mock_user_id')?.value ?? 'user-student-1'
  const audits = await db.getInstagramAudits(userId)

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Bem-vindo de volta</h1>
      <p className="text-aud-text-subtle mb-8">Suas últimas auditorias</p>

      {audits.length === 0 ? (
        <div className="bg-aud-bg-card border border-white/8 rounded-xl p-8 text-center">
          <p className="text-aud-text-subtle mb-4">Nenhuma auditoria ainda</p>
          <Link href="/auditoria/instagram/nova" className="text-aud-gold hover:underline text-sm">
            Iniciar primeira auditoria →
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {audits.map(audit => (
            <Link
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
                <span className="text-2xl font-bold text-aud-gold">{audit.overallScore}</span>
                <TierBadge tier={audit.tier} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
