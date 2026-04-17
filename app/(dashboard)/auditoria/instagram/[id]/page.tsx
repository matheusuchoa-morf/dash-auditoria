import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { TierBadge } from '@/components/audit/TierBadge'
import { LayerScore } from '@/components/audit/LayerScore'
import { KPISnapshot } from '@/components/audit/KPISnapshot'
import { PostAnalysis } from '@/components/audit/PostAnalysis'

export default async function AuditoriaInstagramResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const audit = await db.getInstagramAudit(id)
  if (!audit) notFound()

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">@{audit.instagramHandle}</h1>
          <p className="text-aud-text-subtle text-sm mt-1">{audit.createdAt.toLocaleDateString('pt-BR')}</p>
        </div>
        <div className="text-right">
          <p className="text-5xl font-bold text-aud-gold">{audit.overallScore}</p>
          <TierBadge tier={audit.tier} size="lg" />
        </div>
      </div>

      {/* AI Summary */}
      {audit.aiSummary && (
        <div className="bg-aud-bg-card border border-aud-gold/20 rounded-xl p-5 mb-6">
          <p className="text-aud-text-subtle text-sm leading-relaxed">{audit.aiSummary}</p>
        </div>
      )}

      {/* KPIs */}
      <h2 className="text-lg font-semibold text-white mb-4">KPIs</h2>
      <KPISnapshot kpis={audit.kpis} />

      {/* Layers */}
      <h2 className="text-lg font-semibold text-white mt-8 mb-4">As 4 Camadas</h2>
      <div className="space-y-3">
        <LayerScore label="Camada 1 — Fundamentos de Autoridade" score={audit.layers.authority.score} maxScore={audit.layers.authority.maxScore} feedback={audit.layers.authority.feedback} expanded />
        <LayerScore label="Camada 2 — Performance Quantitativa" score={audit.layers.performance.score} maxScore={audit.layers.performance.maxScore} feedback={`${audit.layers.performance.postsPerWeek} posts/semana`} expanded />
        <LayerScore label="Camada 3 — Estrutura de Negócio" score={audit.layers.business.score} maxScore={audit.layers.business.maxScore} feedback={audit.layers.business.feedback} expanded />
        <LayerScore label="Camada 4 — Engenharia de Atenção" score={audit.layers.attention.averageScore} maxScore={100} feedback={`Média de ${audit.layers.attention.posts.length} posts analisados`} expanded />
      </div>

      {/* Posts */}
      {audit.layers.attention.posts.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-white mt-8 mb-4">Análise de Posts</h2>
          <div className="space-y-3">
            {audit.layers.attention.posts.map((post, i) => (
              <PostAnalysis key={i} post={post} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
