import Anthropic from '@anthropic-ai/sdk'
import type { LayerScore, PostAnalysis } from '@/types/audit'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// System prompt cached via prompt caching (reduces cost on repeated calls)
const SYSTEM_PROMPT = `Você é um especialista em marketing digital e Instagram.
Sua função é avaliar perfis e conteúdos de Instagram de forma estratégica e objetiva.
Sempre responda em JSON válido dentro de blocos de código markdown (\`\`\`json ... \`\`\`).
Seja direto, específico e acionável no feedback. Responda em português brasileiro.`

interface AuthorityInput {
  handle: string
  bio: string
  profilePicUrl: string
  websiteUrl?: string
}

interface BusinessInput {
  handle: string
  bio: string
  recentCaptions: string[]
}

interface AttentionInput {
  postUrl: string
  format: 'reels' | 'carrossel' | 'estatico'
  caption: string
  firstFrameDescription?: string
}

export function buildAuthorityPrompt(input: AuthorityInput): string {
  return `Avalie a Camada 1 (Fundamentos de Autoridade) do perfil @${input.handle}.

Bio atual: "${input.bio}"
URL na bio: ${input.websiteUrl ?? 'não informada'}
Foto de perfil disponível: ${input.profilePicUrl ? 'sim' : 'não'}

Critérios de avaliação (total 100 pontos):
- Foto de perfil transmite autoridade e profissionalismo? (0-25)
- Nome de usuário é claro, pronunciável e memorável? (0-25)
- Bio de conversão: expressa o que vende AGORA e tem CTA? (0-25)
- Link na bio tem objetivo claro (captura, agendamento ou venda direta)? (0-25)

Responda em JSON:
\`\`\`json
{"score": <número 0-100>, "maxScore": 100, "feedback": "<texto específico e acionável>"}
\`\`\``
}

export function buildBusinessPrompt(input: BusinessInput): string {
  return `Avalie a Camada 3 (Estrutura de Negócio) do perfil @${input.handle}.

Bio: "${input.bio}"
Legendas recentes (últimos 5 posts):
${input.recentCaptions.map((c, i) => `${i + 1}. "${c}"`).join('\n')}

Critérios (total 100 pontos):
- Clareza total sobre o produto/ideia sendo vendida (0-34)
- Público específico (Lei da Especificidade: Médicos > Profissionais Liberais) (0-33)
- Narrativa: ponte clara entre problema do público e solução da oferta (0-33)

Responda em JSON:
\`\`\`json
{"score": <número 0-100>, "maxScore": 100, "feedback": "<texto específico>"}
\`\`\``
}

export function buildAttentionPrompt(input: AttentionInput): string {
  return `Avalie a Camada 4 (Engenharia de Atenção) deste post ${input.format}.

Legenda: "${input.caption}"
${input.firstFrameDescription ? `Descrição do primeiro frame: "${input.firstFrameDescription}"` : ''}

Critérios — PONDERAÇÃO ASSIMÉTRICA (total 100 pontos):
- Ato 1 - Gancho (0-60): Roubo de atenção visual, textual ou verbal nos primeiros 2 segundos
- Ato 2 - Desenvolvimento (0-30): Lógica contraintuitiva, fuga do clichê, tensão que mantém retenção
- Ato 3 - CTA (0-10): Chamada clara para o próximo passo do negócio

Responda em JSON:
\`\`\`json
{"hook": <0-60>, "development": <0-30>, "cta": <0-10>, "total": <soma>, "aiFeedback": "<texto>"}
\`\`\``
}

export function parseLayerScore(raw: string): LayerScore {
  try {
    const match = raw.match(/```json\s*([\s\S]*?)\s*```/) ?? raw.match(/(\{[\s\S]*\})/)
    const json = JSON.parse(match?.[1] ?? raw)
    return { score: json.score ?? 0, maxScore: json.maxScore ?? 100, feedback: json.feedback ?? '' }
  } catch {
    return { score: 0, maxScore: 100, feedback: 'Não foi possível completar a análise. Tente novamente.' }
  }
}

export function parsePostAnalysis(raw: string, postUrl: string, format: PostAnalysis['format']): PostAnalysis {
  try {
    const match = raw.match(/```json\s*([\s\S]*?)\s*```/) ?? raw.match(/(\{[\s\S]*\})/)
    const json = JSON.parse(match?.[1] ?? raw)
    const hook = Math.min(json.hook ?? 0, 60)
    const development = Math.min(json.development ?? 0, 30)
    const cta = Math.min(json.cta ?? 0, 10)
    return { postUrl, format, hook, development, cta, total: hook + development + cta, aiFeedback: json.aiFeedback ?? '' }
  } catch {
    return { postUrl, format, hook: 0, development: 0, cta: 0, total: 0, aiFeedback: 'Análise indisponível.' }
  }
}

export async function analyzeAuthority(input: AuthorityInput): Promise<LayerScore> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: buildAuthorityPrompt(input) }],
  })
  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  return parseLayerScore(text)
}

export async function analyzeBusiness(input: BusinessInput): Promise<LayerScore> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: buildBusinessPrompt(input) }],
  })
  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  return parseLayerScore(text)
}

export async function analyzePost(input: AttentionInput): Promise<PostAnalysis> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: buildAttentionPrompt(input) }],
  })
  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  return parsePostAnalysis(text, input.postUrl, input.format)
}

export async function generateSummary(handle: string, overallScore: number, tier: string): Promise<string> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 256,
    system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
    messages: [{
      role: 'user',
      content: `Escreva um parecer geral de 2-3 frases para o perfil @${handle} que obteve score ${overallScore}/100 (tier: ${tier}). Seja direto e acionável.`,
    }],
  })
  return message.content[0].type === 'text' ? message.content[0].text : ''
}
