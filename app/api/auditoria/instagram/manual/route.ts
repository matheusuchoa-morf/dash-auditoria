import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { instagramAuditLimiter } from '@/lib/rate-limit'
import { analyzeAuthority, analyzeBusiness, analyzePost } from '@/lib/ai-analyzer'
import { db } from '@/lib/db'
import { tierFromPostsPerWeek, calcOverallScore } from '@/types/audit'
import type { InstagramAudit, PostAnalysis } from '@/types/audit'

// Mock fallback for when ANTHROPIC_API_KEY=mock_key
function buildMockLayers(handle: string): InstagramAudit['layers'] {
  const mockPosts: PostAnalysis[] = [
    { postUrl: '#manual-post-1', format: 'estatico', hook: 42, development: 21, cta: 8, total: 71, aiFeedback: 'Gancho textual forte. Desenvolvimento claro. CTA presente.' },
    { postUrl: '#manual-post-2', format: 'carrossel', hook: 38, development: 24, cta: 7, total: 69, aiFeedback: 'Abertura boa. Tensão narrativa no desenvolvimento. CTA pode ser mais específico.' },
    { postUrl: '#manual-post-3', format: 'reels', hook: 50, development: 20, cta: 9, total: 79, aiFeedback: 'Gancho visual muito forte. Desenvolvimento médio. CTA direto.' },
  ]
  return {
    authority: { score: 72, maxScore: 100, feedback: 'Bio clara com CTA. Link funcional.' },
    performance: { tier: 'ouro', postsPerWeek: 7, score: 80, maxScore: 100 },
    business: { score: 68, maxScore: 100, feedback: `Oferta identificável em @${handle}. Público bem definido.` },
    attention: { posts: mockPosts, averageScore: Math.round((71 + 69 + 79) / 3) },
  }
}

export async function POST(req: NextRequest) {
  const authResult = await requireAuth()
  if (authResult instanceof NextResponse) return authResult
  const { user } = authResult

  if (!instagramAuditLimiter.check(user.id)) {
    return NextResponse.json({ error: 'Limite de 5 auditorias/hora atingido' }, { status: 429 })
  }

  const body = await req.json()
  const { handle, bio, websiteUrl, captions }: {
    handle: string
    bio: string
    websiteUrl?: string
    captions: string[]
  } = body

  if (!handle?.trim()) {
    return NextResponse.json({ error: 'Informe o @ do perfil' }, { status: 400 })
  }
  if (!bio?.trim() && (!captions || captions.filter(Boolean).length === 0)) {
    return NextResponse.json({ error: 'Informe a bio ou pelo menos uma legenda de post' }, { status: 400 })
  }

  const isMockKey = (process.env.ANTHROPIC_API_KEY ?? '').startsWith('mock')

  try {
    let layers: InstagramAudit['layers']

    if (isMockKey) {
      layers = buildMockLayers(handle)
    } else {
      // Run all 3 layers in parallel — no Instagram API needed
      const postInputs = (captions ?? [])
        .filter(Boolean)
        .slice(0, 3)
        .map((caption, i) => ({
          postUrl: `#manual-post-${i + 1}`,
          format: 'estatico' as const,
          caption,
        }))

      const [authority, business, ...postAnalyses] = await Promise.all([
        analyzeAuthority({
          handle,
          bio: bio ?? '',
          profilePicUrl: '',        // not available in manual mode
          websiteUrl: websiteUrl ?? '',
        }),
        analyzeBusiness({
          handle,
          bio: bio ?? '',
          recentCaptions: captions ?? [],
        }),
        ...postInputs.map(p => analyzePost(p)),
      ])

      const postsPerWeek = 7 // default assumption in manual mode
      const performanceTier = tierFromPostsPerWeek(postsPerWeek)
      const performanceScore = performanceTier === 'platina' ? 100 : performanceTier === 'ouro' ? 80 : performanceTier === 'prata' ? 60 : 40
      const averageAttentionScore = postAnalyses.length > 0
        ? Math.round(postAnalyses.reduce((sum, p) => sum + p.total, 0) / postAnalyses.length)
        : 0

      layers = {
        authority,
        performance: { tier: performanceTier, postsPerWeek, score: performanceScore, maxScore: 100 },
        business,
        attention: { posts: postAnalyses, averageScore: averageAttentionScore },
      }
    }

    const overallScore = calcOverallScore(layers)
    const tier = layers.performance.tier
    const aiSummary = isMockKey
      ? `Análise manual de @${handle}. Score geral: ${overallScore}/100.`
      : `Análise baseada nos dados informados para @${handle}. Score geral: ${overallScore}/100.`

    const audit = await db.saveInstagramAudit({
      userId: user.id,
      instagramHandle: handle,
      tier,
      overallScore,
      layers,
      kpis: {
        profileStatus: layers.authority.score >= 70 ? 'ajustado' : 'nao_ajustado',
        frequencyTier: tier,
        bioConversion: !!(websiteUrl?.trim()),
        narrativeQuality: layers.attention.averageScore,
        pareto8020Applied: false,
      },
      aiSummary,
    })

    return NextResponse.json({ audit })
  } catch (err) {
    console.error('[audit/instagram/manual] Error:', err)
    return NextResponse.json({ error: 'Erro ao processar auditoria' }, { status: 500 })
  }
}
