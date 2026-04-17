import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { randomUUID } from 'crypto'

export async function POST(req: NextRequest) {
  const authResult = await requireAuth()
  if (authResult instanceof NextResponse) return authResult
  const { user } = authResult

  const { url, caption, format } = await req.json()
  if (!url && !caption) {
    return NextResponse.json({ error: 'Informe URL ou texto do criativo' }, { status: 400 })
  }

  // Mock scoring (will be replaced by Claude analysis)
  const hook = Math.floor(Math.random() * 20) + 35      // 35-55
  const development = Math.floor(Math.random() * 10) + 18 // 18-28
  const cta = Math.floor(Math.random() * 4) + 6          // 6-10
  const total = hook + development + cta

  const audit = {
    id: randomUUID(),
    userId: user.id,
    createdAt: new Date(),
    format: format ?? 'reels',
    url: url ?? null,
    caption: caption ?? null,
    hook,
    development,
    cta,
    total,
    aiFeedback: `Gancho ${hook >= 45 ? 'forte' : 'mediano'} (${hook}/60). Desenvolvimento ${development >= 24 ? 'sólido' : 'pode melhorar'} (${development}/30). CTA ${cta >= 8 ? 'claro' : 'fraco'} (${cta}/10). Total: ${total}/100.`,
    recommendations: [
      hook < 45 ? 'Fortaleça o gancho visual nos primeiros 3 segundos' : 'Gancho eficiente — mantenha o padrão',
      development < 22 ? 'Adicione lógica contraintuitiva no desenvolvimento para manter retenção' : 'Desenvolvimento com boa tensão narrativa',
      cta < 8 ? 'CTA mais específico: troque "saiba mais" por ação concreta' : 'CTA direto e claro',
      format === 'reels' ? 'Para Reels: primeiros 2s são críticos — corte imediato na abertura' : null,
      format === 'carrossel' ? 'Para Carrossel: slide 1 = gancho, slide final = CTA' : null,
    ].filter(Boolean),
  }

  return NextResponse.json({ audit })
}
