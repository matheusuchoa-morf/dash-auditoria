import type { KPISnapshot as KPISnapshotType } from '@/types/audit'
import { TierBadge } from './TierBadge'
import { CheckCircle, XCircle } from 'lucide-react'

export function KPISnapshot({ kpis }: { kpis: KPISnapshotType }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <KPICard label="Status de Perfil" value={kpis.profileStatus === 'ajustado' ? 'Ajustado' : 'Não Ajustado'} ok={kpis.profileStatus === 'ajustado'} />
      <div className="bg-aud-bg-card border border-white/8 rounded-xl p-4">
        <p className="text-aud-text-subtle text-xs mb-2">Nível de Frequência</p>
        <TierBadge tier={kpis.frequencyTier} />
      </div>
      <KPICard label="Conversão de Bio" value={kpis.bioConversion ? 'Funcional' : 'Sem objetivo'} ok={kpis.bioConversion} />
      <div className="bg-aud-bg-card border border-white/8 rounded-xl p-4">
        <p className="text-aud-text-subtle text-xs mb-2">Qualidade de Narrativa</p>
        <p className="text-2xl font-bold text-white">{kpis.narrativeQuality}<span className="text-aud-text-subtle text-sm">/100</span></p>
      </div>
      <KPICard label="Regra 80/20" value={kpis.pareto8020Applied ? 'Aplicado' : 'Pendente'} ok={kpis.pareto8020Applied} />
    </div>
  )
}

function KPICard({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div className="bg-aud-bg-card border border-white/8 rounded-xl p-4 flex items-start gap-3">
      {ok ? <CheckCircle size={18} className="text-aud-success mt-0.5 shrink-0" /> : <XCircle size={18} className="text-aud-danger mt-0.5 shrink-0" />}
      <div>
        <p className="text-aud-text-subtle text-xs">{label}</p>
        <p className="text-white text-sm font-medium mt-0.5">{value}</p>
      </div>
    </div>
  )
}
