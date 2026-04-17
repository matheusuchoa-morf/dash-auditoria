export type AuditTier = 'bronze' | 'prata' | 'ouro' | 'platina'
export type UserRole = 'student' | 'mentor' | 'admin'

export interface MockUser {
  id: string
  email: string
  role: UserRole
  instagramHandle?: string
}

export interface LayerScore {
  score: number
  maxScore: number
  feedback: string
}

export interface PostAnalysis {
  postUrl: string
  format: 'reels' | 'carrossel' | 'estatico'
  hook: number        // 0–60
  development: number // 0–30
  cta: number         // 0–10
  total: number       // 0–100 (hook + development + cta)
  aiFeedback: string
}

export interface KPISnapshot {
  profileStatus: 'ajustado' | 'nao_ajustado'
  frequencyTier: AuditTier
  bioConversion: boolean
  narrativeQuality: number // 0–100, average of posts
  pareto8020Applied: boolean
}

export interface InstagramAudit {
  id: string
  userId: string
  createdAt: Date
  instagramHandle: string
  tier: AuditTier
  overallScore: number // 0–100, weighted average of layers
  layers: {
    authority: LayerScore
    performance: { tier: AuditTier; postsPerWeek: number; score: number; maxScore: number }
    business: LayerScore
    attention: { posts: PostAnalysis[]; averageScore: number }
  }
  kpis: KPISnapshot
  aiSummary: string
}

export interface CROFinding {
  section: string
  issue: string
  recommendation: string
  impact: 'alto' | 'medio' | 'baixo'
}

export interface LPAudit {
  id: string
  userId: string
  createdAt: Date
  pageUrl: string
  croScore: number // 0–100
  findings: CROFinding[]
  recommendations: string[]
  aiSummary: string
}

export interface StudentSummary {
  userId: string
  email: string
  instagramHandle: string
  tier: AuditTier
  overallScore: number
  lastAuditDate: Date
  totalAudits: number
}

// Helper: derives tier from posts per week
export function tierFromPostsPerWeek(postsPerWeek: number): AuditTier {
  if (postsPerWeek > 14) return 'platina'
  if (postsPerWeek >= 7) return 'ouro'
  if (postsPerWeek >= 5) return 'prata'
  return 'bronze'
}

// Helper: calculates overall score from layers
export function calcOverallScore(layers: InstagramAudit['layers']): number {
  const authority = layers.authority.score
  const performance = layers.performance.score
  const business = layers.business.score
  const attention = layers.attention.averageScore
  return Math.round((authority + performance + business + attention) / 4)
}
