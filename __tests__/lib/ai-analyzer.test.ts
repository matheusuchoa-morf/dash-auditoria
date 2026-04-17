import { buildAuthorityPrompt, buildBusinessPrompt, parseLayerScore, parsePostAnalysis } from '@/lib/ai-analyzer'

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

describe('buildBusinessPrompt', () => {
  it('numbers captions and includes handle', () => {
    const prompt = buildBusinessPrompt({
      handle: 'maria.coach',
      bio: 'Coach de emagrecimento',
      recentCaptions: ['Perdi 10kg em 3 meses', 'Método simples que funciona'],
    })
    expect(prompt).toContain('maria.coach')
    expect(prompt).toContain('1. "Perdi 10kg em 3 meses"')
    expect(prompt).toContain('2. "Método simples que funciona"')
  })
})

describe('buildAuthorityPrompt', () => {
  it('uses não informada when websiteUrl is absent', () => {
    const prompt = buildAuthorityPrompt({ handle: 'test', bio: 'bio', profilePicUrl: '' })
    expect(prompt).toContain('não informada')
  })
})

describe('parsePostAnalysis', () => {
  it('clamps hook to 60 even if model returns higher', () => {
    const raw = '```json\n{"hook": 99, "development": 25, "cta": 8, "total": 132, "aiFeedback": "ok"}\n```'
    const result = parsePostAnalysis(raw, 'https://example.com', 'reels')
    expect(result.hook).toBe(60)
    expect(result.total).toBe(60 + 25 + 8)
  })

  it('returns fallback on invalid JSON', () => {
    const result = parsePostAnalysis('bad response', 'https://example.com', 'carrossel')
    expect(result.hook).toBe(0)
    expect(result.total).toBe(0)
    expect(result.aiFeedback).toBeTruthy()
  })
})
