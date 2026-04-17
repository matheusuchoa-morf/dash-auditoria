import { tierFromPostsPerWeek, calcOverallScore } from '@/types/audit'

describe('tierFromPostsPerWeek', () => {
  it('returns bronze for < 3 posts', () => {
    expect(tierFromPostsPerWeek(2)).toBe('bronze')
  })
  it('returns prata for 5 posts', () => {
    expect(tierFromPostsPerWeek(5)).toBe('prata')
  })
  it('returns ouro for 7 posts', () => {
    expect(tierFromPostsPerWeek(7)).toBe('ouro')
  })
  it('returns platina for > 14 posts', () => {
    expect(tierFromPostsPerWeek(15)).toBe('platina')
  })
})

describe('calcOverallScore', () => {
  it('averages all 4 layer scores', () => {
    const layers = {
      authority: { score: 80, maxScore: 100, feedback: '' },
      performance: { tier: 'ouro' as const, postsPerWeek: 7, score: 70, maxScore: 100 },
      business: { score: 60, maxScore: 100, feedback: '' },
      attention: { posts: [], averageScore: 90 },
    }
    expect(calcOverallScore(layers)).toBe(75)
  })
})
