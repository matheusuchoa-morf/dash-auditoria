import { db } from '@/lib/db'
import { TierBadge } from '@/components/audit/TierBadge'
import Link from 'next/link'

export default async function MentorPage() {
  const students = await db.getAllStudentsLatestAudit()
  const ranked = [...students].sort((a, b) => b.overallScore - a.overallScore)

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Ranking de Alunos</h1>
      <p className="text-aud-text-subtle mb-8">{ranked.length} aluno(s) auditado(s)</p>

      {ranked.length === 0 ? (
        <div className="bg-aud-bg-card border border-white/8 rounded-xl p-8 text-center">
          <p className="text-aud-text-subtle text-sm">Nenhum aluno auditado ainda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {ranked.map((student, i) => (
            <div key={student.userId} className="bg-aud-bg-card border border-white/8 rounded-xl p-5 flex items-center gap-5">
              <span className={`text-2xl font-bold w-8 shrink-0 ${
                i === 0 ? 'text-aud-gold' : i === 1 ? 'text-[#A8A9AD]' : i === 2 ? 'text-[#CD7F32]' : 'text-aud-text-subtle'
              }`}>
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white">@{student.instagramHandle}</p>
                <p className="text-aud-text-subtle text-xs mt-0.5">{student.email}</p>
              </div>
              <div className="text-right mr-2">
                <p className="text-aud-text-subtle text-xs">{student.totalAudits} auditoria(s)</p>
                <p className="text-aud-text-subtle text-xs">{student.lastAuditDate.toLocaleDateString('pt-BR')}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-2xl font-bold text-aud-gold">{student.overallScore}</span>
                <TierBadge tier={student.tier} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
