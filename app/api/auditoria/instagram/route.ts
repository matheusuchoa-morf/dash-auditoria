import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { instagramAuditLimiter } from '@/lib/rate-limit'
import { getProfile, getRecentMedia, guessPostFormat, countPostsInLastDays } from '@/lib/instagram-api'
import { analyzeAuthority, analyzeBusiness, analyzePost, generateSummary } from '@/lib/ai-analyzer'
import { db } from '@/lib/db'
import { tierFromPostsPerWeek, calcOverallScore } from '@/types/audit'
import type { InstagramAudit } from '@/types/audit'

export async function POST(req: NextRequest) {
  const authResult = await requireAuth()
  if (authResult instanceof NextResponse) return authResult
  const { user } = authResult

  if (!instagramAuditLimiter.check(user.id)) {
    return NextResponse.json({ error: 'Limite de 5 auditorias/hora atingido' }, { status: 429 })
  }

  const encToken = req.cookies.get('ig_token_enc')?.value
  if (!encToken) return NextResponse.json({ error: 'Instagram não conectado' }, { status: 400 })

  try {
    const [profile, media] = await Promise.all([
      getProfile(encToken),
      getRecentMedia(encToken, 12),
    ])

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

    const layers: InstagramAudit['layers'] = {
      authority,
      performance: { tier: performanceTier, postsPerWeek, score: performanceScore, maxScore: 100 },
      business,
      attention: { posts: postAnalyses, averageScore: averageAttentionScore },
    }

    const overallScore = calcOverallScore(layers)
    const tier = tierFromPostsPerWeek(postsPerWeek)
    const aiSummary = await generateSummary(profile.username, overallScore, tier)

    const audit = await db.saveInstagramAudit({
      userId: user.id,
      instagramHandle: profile.username,
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
    console.error('Audit error:', err)
    return NextResponse.json({ error: 'Erro ao processar auditoria' }, { status: 500 })
  }
}
