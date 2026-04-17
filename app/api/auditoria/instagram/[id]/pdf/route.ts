import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { renderToBuffer } from '@react-pdf/renderer'
import type { DocumentProps } from '@react-pdf/renderer'
import { AuditPDFDocument } from '@/lib/pdf-generator'
import React from 'react'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAuth()
  if (authResult instanceof NextResponse) return authResult

  const { id } = await params
  const audit = await db.getInstagramAudit(id)
  if (!audit) return NextResponse.json({ error: 'Auditoria não encontrada' }, { status: 404 })

  // Students can only download their own audits; mentors/admins can view any
  if (authResult.user.role === 'student' && audit.userId !== authResult.user.id) {
    return NextResponse.json({ error: 'Auditoria não encontrada' }, { status: 404 })
  }

  const element = React.createElement(AuditPDFDocument, { audit }) as React.ReactElement<DocumentProps>

  try {
    const buffer = await renderToBuffer(element)
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="auditoria-${audit.instagramHandle}-${audit.id.slice(0, 8)}.pdf"`,
      },
    })
  } catch (err) {
    console.error('[pdf/route] renderToBuffer failed', err)
    return NextResponse.json({ error: 'Falha ao gerar PDF' }, { status: 500 })
  }
}
