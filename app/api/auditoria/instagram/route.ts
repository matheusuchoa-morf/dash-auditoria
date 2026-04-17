import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { instagramAuditLimiter } from '@/lib/rate-limit'
import { getProfile, getRecentMedia, guessPostFormat, countPostsInLastDays } from '@/lib/instagram-api'
import { analyzeAuthority, analyzeBusiness, analyzePost, generateSummary } from '@/lib/ai-analyzer'
import { decrypt } from '@/lib/crypto'
import { db } from '@/lib/db'
import { tierFromPostsPerWeek, calcOverallScore } from '@/types/audit'
import type { InstagramAudit, LayerScore, PostAnalysis } from '@/types/audit'

function getEncryptionKey(): string {
  return process.env.ENCRYPTION_KEY ?? 'dev-encryption-key-change-in-prod'
}

export async function POST(req: NextRequest) {
  const authResult = await requireAuth()
  if (authResult instanceof NextResponse) return authResult
  const { user } = authResult

  if (!instagramAuditLimiter.check(user.id)) {
    return NextResponse.json({ error: 'Limite de 5 auditorias/hora atingido' }, { status: 429 })
  }

  const encToken = req.cookies.get('ig_token_enc')?.value
  if (!encToken) return NextResponse.json({ error: 'Instagram não conectado' }, { status: 400 })

  // Detect dev mode: token was stored as encrypt("dev:handle")
  let rawToken: string
  try {
    rawToken = decrypt(encToken, getEncryptionKey())
  } catch {
    return NextResponse.json({ error: 'Token inválido. Reconecte sua conta.' }, { status: 400 })
  }

  const isDevMode = rawToken.startsWith('dev:')
  const devHandle = isDevMode ? rawToken.slice(4) : ''

  // Phase 2: analysis + DB save
  try {
    let layers: InstagramAudit['layers']
    let instagramHandle: string

    if (isDevMode) {
      // Dev mode: skip real Instagram API + AI calls, use mock data
      instagramHandle = devHandle

      const authority: LayerScore = {
        score: 72,
        maxScore: 100,
        feedback: 'Perfil bem estruturado. Bio clara com CTA. Foto profissional.',
      }
      const business: LayerScore = {
        score: 68,
        maxScore: 100,
        feedback: 'Oferta identificável. Público bem definido. Narrativa coerente.',
      }
      const mockPosts: PostAnalysis[] = Array.from({ length: 3 }, (_, i) => ({
        postUrl: `https://www.instagram.com/p/mock${i}/`,
        format: 'estatico' as const,
        hook: 45 - i * 5,
        development: 22 - i * 2,
        cta: 8,
        total: 75 - i * 7,
        aiFeedback: 'Gancho visual forte. Desenvolvimento lógico. CTA presente.',
      }))
      const averageAttentionScore = Math.round(
        mockPosts.reduce((sum, p) => sum + p.total, 0) / mockPosts.length
      )
      const postsPerWeek = 7
      const performanceTier = tierFromPostsPerWeek(postsPerWeek)
      const performanceScore = 80

      layers = {
        authority,
        performance: { tier: performanceTier, postsPerWeek, score: performanceScore, maxScore: 100 },
        business,
        attention: { posts: mockPosts, averageScore: averageAttentionScore },
      }

      const overallScore = calcOverallScore(layers)
      const tier = performanceTier
      const aiSummary = `Análise de desenvolvimento para @${devHandle}. Perfil com bom potencial. Pontuação geral: ${overallScore}/100.`

      const audit = await db.saveInstagramAudit({
        userId: user.id,
        instagramHandle,
        tier,
        overallScore,
        layers,
        kpis: {
          profileStatus: authority.score >= 70 ? 'ajustado' : 'nao_ajustado',
          frequencyTier: performanceTier,
          bioConversion: true,
          narrativeQuality: averageAttentionScore,
          pareto8020Applied: false,
        },
        aiSummary,
      })

      return NextResponse.json({ audit })
    }

    // Phase 1: Fetch real Instagram data
    let profile: Awaited<ReturnType<typeof getProfile>>
    let media: Awaited<ReturnType<typeof getRecentMedia>>
    try {
      ;[profile, media] = await Promise.all([
        getProfile(encToken),
        getRecentMedia(encToken, 50), // 50 posts for reliable 7-day frequency calculation
      ])
    } catch (err) {
      console.error('[audit/instagram] Instagram API error:', err)
      return NextResponse.json({ error: 'Falha ao buscar dados do Instagram. Reconecte sua conta.' }, { status: 401 })
    }

    instagramHandle = profile.username
    const recentCaptions = media.slice(0, 5).map(m => m.caption ?? '').filter(Boolean)
    const postsPerWeek = countPostsInLastDays(media, 7)

    // Run AI analyses in parallel
    const [authority, business, ...postAnalyses] = await Promise.all([
      analyzeAuthority({
        handle: profile.username,
        bio: profile.biography,
        profilePicUrl: profile.profile_picture_url,
        websiteUrl: profile.website,
      }),
      analyzeBusiness({
        handle: profile.username,
        bio: profile.biography,
        recentCaptions,
      }),
      ...media.slice(0, 3).map(m =>
        analyzePost({
          postUrl: m.permalink,
          format: guessPostFormat(m),
          caption: m.caption ?? '',
        })
      ),
    ])

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

    const overallScore = calcOverallScore(layers)
    const tier = performanceTier
    const aiSummary = await generateSummary(profile.username, overallScore, tier)

    const audit = await db.saveInstagramAudit({
      userId: user.id,
      instagramHandle,
      tier,
      overallScore,
      layers,
      kpis: {
        profileStatus: authority.score >= 70 ? 'ajustado' : 'nao_ajustado',
        frequencyTier: performanceTier,
        bioConversion: !!(profile.website),
        narrativeQuality: averageAttentionScore,
        pareto8020Applied: false,
      },
      aiSummary,
    })

    return NextResponse.json({ audit })
  } catch (err) {
    console.error('[audit/instagram] Processing error:', err)
    return NextResponse.json({ error: 'Erro ao processar auditoria' }, { status: 500 })
  }
}
