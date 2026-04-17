import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { encrypt } from '@/lib/crypto'

function getEncryptionKey(): string {
  const key = process.env.ENCRYPTION_KEY ?? 'dev-encryption-key-change-in-prod'
  return key
}

export async function POST(req: NextRequest) {
  const authResult = await requireAuth()
  if (authResult instanceof NextResponse) return authResult

  const { handle } = await req.json()
  if (!handle || typeof handle !== 'string') {
    return NextResponse.json({ error: 'Handle inválido' }, { status: 400 })
  }

  // Store as "dev:handle" encrypted — the audit API will detect this prefix
  const cleanHandle = handle.replace('@', '').trim()
  const token = encrypt(`dev:${cleanHandle}`, getEncryptionKey())
  const res = NextResponse.json({ ok: true })
  res.cookies.set('ig_token_enc', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
    path: '/',
  })
  return res
}
