import type { InstagramAudit } from '@/types/audit'
import { TierBadge } from './TierBadge'
import Link from 'next/link'

export function AuditCard({ audit }: { audit: InstagramAudit }) {
  return (
    <Link
      href={`/auditoria/instagram/${audit.id}`}
      className="bg-aud-bg-card border border-white/8 rounded-xl p-5 flex items-center justify-between hover:border-aud-gold/30 transition-colors"
    >
      <div>
        <p className="font-semibold text-white">@{audit.instagramHandle}</p>
        <p className="text-aud-text-subtle text-xs mt-1">
          {audit.createdAt.toLocaleDateString('pt-BR')}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-aud-text-subtle text-xs">Score Geral</p>
          <p className="text-2xl font-bold text-aud-gold">{audit.overallScore}</p>
        </div>
        <TierBadge tier={audit.tier} />
      </div>
    </Link>
  )
}
