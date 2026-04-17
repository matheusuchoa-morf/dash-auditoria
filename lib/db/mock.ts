import type { AuditRepository } from './repository'
import type { InstagramAudit, LPAudit, StudentSummary } from '@/types/audit'
import { randomUUID } from 'crypto'
import { getMockUsers } from '@/lib/auth'

const instagramAudits: InstagramAudit[] = [
  {
    id: 'mock-ig-1',
    userId: 'user-student-1',
    createdAt: new Date('2026-04-10'),
    instagramHandle: 'joaosilva.coach',
    tier: 'prata',
    overallScore: 68,
    layers: {
      authority: { score: 72, maxScore: 100, feedback: 'Bio clara mas sem CTA direto para vendas.' },
      performance: { tier: 'prata', postsPerWeek: 5, score: 65, maxScore: 100 },
      business: { score: 60, maxScore: 100, feedback: 'Oferta identificável, público ainda genérico.' },
      attention: {
        posts: [
          {
            postUrl: 'https://instagram.com/p/mock1',
            format: 'reels',
            hook: 45,
            development: 22,
            cta: 7,
            total: 74,
            aiFeedback: 'Gancho visual forte, CTA poderia ser mais direto.',
          },
        ],
        averageScore: 74,
      },
    },
    kpis: {
      profileStatus: 'ajustado',
      frequencyTier: 'prata',
      bioConversion: true,
      narrativeQuality: 74,
      pareto8020Applied: false,
    },
    aiSummary: 'Perfil com boa consistência de postagem. Principal oportunidade: especificar melhor o público-alvo na bio e nos posts.',
  },
  {
    id: 'mock-ig-2',
    userId: 'user-mentor-1',
    createdAt: new Date('2026-04-14'),
    instagramHandle: 'mariamentora',
    tier: 'ouro',
    overallScore: 82,
    layers: {
      authority: { score: 88, maxScore: 100, feedback: 'Bio excelente com CTA claro e foto profissional.' },
      performance: { tier: 'ouro', postsPerWeek: 9, score: 80, maxScore: 100 },
      business: { score: 78, maxScore: 100, feedback: 'Nicho bem definido, narrativa coerente com a oferta.' },
      attention: {
        posts: [
          {
            postUrl: 'https://instagram.com/p/mock2',
            format: 'carrossel',
            hook: 52,
            development: 25,
            cta: 9,
            total: 86,
            aiFeedback: 'Gancho textual muito forte. Lógica contraintuitiva presente.',
          },
        ],
        averageScore: 86,
      },
    },
    kpis: {
      profileStatus: 'ajustado',
      frequencyTier: 'ouro',
      bioConversion: true,
      narrativeQuality: 86,
      pareto8020Applied: true,
    },
    aiSummary: 'Perfil de alto desempenho. Foco em manter consistência e explorar mais formatos de Reels.',
  },
]

const lpAudits: LPAudit[] = []

export const mockRepository: AuditRepository = {
  async getInstagramAudits(userId) {
    return instagramAudits.filter(a => a.userId === userId)
  },
  async getInstagramAudit(id) {
    return instagramAudits.find(a => a.id === id) ?? null
  },
  async saveInstagramAudit(audit) {
    const saved: InstagramAudit = { ...audit, id: randomUUID(), createdAt: new Date() }
    instagramAudits.push(saved)
    return saved
  },
  async getLPAudits(userId) {
    return lpAudits.filter(a => a.userId === userId)
  },
  async getLPAudit(id) {
    return lpAudits.find(a => a.id === id) ?? null
  },
  async saveLPAudit(audit) {
    const saved: LPAudit = { ...audit, id: randomUUID(), createdAt: new Date() }
    lpAudits.push(saved)
    return saved
  },
  async getAllStudentsLatestAudit(): Promise<StudentSummary[]> {
    // Instagram-only summary — LP audits are not included in this view
    const byUser = new Map<string, { latest: InstagramAudit; count: number }>()
    for (const a of instagramAudits) {
      const entry = byUser.get(a.userId)
      if (!entry || a.createdAt > entry.latest.createdAt) {
        byUser.set(a.userId, { latest: a, count: (entry?.count ?? 0) + 1 })
      } else {
        byUser.set(a.userId, { ...entry, count: entry.count + 1 })
      }
    }
    const mockUsers = getMockUsers()
    return Array.from(byUser.values()).map(({ latest, count }) => ({
      userId: latest.userId,
      email: mockUsers.find(u => u.id === latest.userId)?.email ?? `${latest.userId}@mock.com`,
      instagramHandle: latest.instagramHandle,
      tier: latest.tier,
      overallScore: latest.overallScore,
      lastAuditDate: latest.createdAt,
      totalAudits: count,
    }))
  },
}
