import { buildAuthorityPrompt, parseLayerScore } from '@/lib/ai-analyzer'

describe('buildAuthorityPrompt', () => {
  it('includes the instagram handle', () => {
    const prompt = buildAuthorityPrompt({ handle: 'joao.coach', bio: 'Coach de negócios', profilePicUrl: 'https://example.com/pic.jpg', websiteUrl: 'https://joao.com' })
    expect(prompt).toContain('joao.coach')
    expect(prompt).toContain('Coach de negócios')
  })
})

describe('parseLayerScore', () => {
  it('parses a valid JSON response', () => {
    const raw = '```json\n{"score": 75, "maxScore": 100, "feedback": "Boa bio"}\n```'
    const result = parseLayerScore(raw)
    expect(result.score).toBe(75)
    expect(result.feedback).toBe('Boa bio')
  })

  it('returns fallback on invalid JSON', () => {
    const result = parseLayerScore('invalid response')
    expect(result.score).toBe(0)
    expect(result.feedback).toContain('análise')
  })
})
