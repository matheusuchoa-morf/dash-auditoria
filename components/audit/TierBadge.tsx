import type { AuditTier } from '@/types/audit'

const TIER_CONFIG: Record<AuditTier, { label: string; color: string; bg: string }> = {
  bronze:  { label: 'Bronze',  color: 'text-[#CD7F32]', bg: 'bg-[#CD7F32]/15' },
  prata:   { label: 'Prata',   color: 'text-[#A8A9AD]', bg: 'bg-[#A8A9AD]/15' },
  ouro:    { label: 'Ouro',    color: 'text-aud-gold',  bg: 'bg-aud-gold/15'  },
  platina: { label: 'Platina', color: 'text-[#E5E4E2]', bg: 'bg-[#E5E4E2]/15' },
}

interface TierBadgeProps { tier: AuditTier; size?: 'sm' | 'md' | 'lg' }

export function TierBadge({ tier, size = 'md' }: TierBadgeProps) {
  const { label, color, bg } = TIER_CONFIG[tier]
  const sizeClass =
    size === 'sm' ? 'text-xs px-2 py-0.5' :
    size === 'lg' ? 'text-base px-4 py-1.5' :
                    'text-sm px-3 py-1'
  return (
    <span className={`inline-flex items-center rounded-full font-semibold ${color} ${bg} ${sizeClass}`}>
      {label}
    </span>
  )
}
