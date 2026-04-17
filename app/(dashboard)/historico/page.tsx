import { db } from '@/lib/db'
import { cookies } from 'next/headers'
import { AuditCard } from '@/components/audit/AuditCard'
import Link from 'next/link'

export default async function HistoricoPage() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('mock_user_id')?.value ?? 'user-student-1'

  const [audits, lpAudits] = await Promise.all([
    db.getInstagramAudits(userId),
    db.getLPAudits(userId),
  ])

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Histórico</h1>
      <p className="text-aud-text-subtle mb-8">Todas as suas auditorias</p>

      {audits.length > 0 && (
        <section className="mb-8">
          <h2 className="text-base font-semibold text-aud-text-subtle mb-4">Instagram</h2>
          <div className="space-y-3">
            {audits.map(a => <AuditCard key={a.id} audit={a} />)}
          </div>
        </section>
      )}

      {lpAudits.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-aud-text-subtle mb-4">Landing Pages</h2>
          <div className="space-y-3">
            {lpAudits.map(a => (
              <Link
                key={a.id}
                href={`/auditoria/lp/${a.id}`}
                className="bg-aud-bg-card border border-white/8 rounded-xl p-5 flex items-center justify-between hover:border-aud-gold/30 transition-colors"
              >
                <div>
                  <p className="font-medium text-white text-sm break-all">{a.pageUrl}</p>
                  <p className="text-aud-text-subtle text-xs mt-1">{a.createdAt.toLocaleDateString('pt-BR')}</p>
                </div>
                <span className="text-2xl font-bold text-aud-gold">{a.croScore}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {audits.length === 0 && lpAudits.length === 0 && (
        <div className="bg-aud-bg-card border border-white/8 rounded-xl p-8 text-center">
          <p className="text-aud-text-subtle mb-4">Nenhuma auditoria encontrada.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/auditoria/instagram/nova" className="text-aud-gold hover:underline text-sm">Auditar Instagram →</Link>
            <Link href="/auditoria/lp/nova" className="text-aud-gold hover:underline text-sm">Auditar LP →</Link>
          </div>
        </div>
      )}
    </div>
  )
}
