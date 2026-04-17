import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { lpAuditLimiter } from '@/lib/rate-limit'
import { analyzeLandingPage } from '@/lib/cro-analyzer'
import { db } from '@/lib/db'
import { z } from 'zod'

const bodySchema = z.object({ url: z.string().url() })

export async function POST(req: NextRequest) {
  const authResult = await requireAuth()
  if (authResult instanceof NextResponse) return authResult
  const { user } = authResult

  if (!lpAuditLimiter.check(user.id)) {
    return NextResponse.json({ error: 'Limite de 5 auditorias/hora atingido' }, { status: 429 })
  }

  const parsed = bodySchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'URL inválida' }, { status: 400 })

  try {
    const result = await analyzeLandingPage(parsed.data.url)
    const audit = await db.saveLPAudit({ userId: user.id, ...result })
    return NextResponse.json({ audit })
  } catch (err) {
    console.error('[auditoria/lp]', err)
    return NextResponse.json({ error: 'Erro ao analisar página' }, { status: 500 })
  }
}
