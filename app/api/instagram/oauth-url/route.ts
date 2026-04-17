import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { getOAuthUrl } from '@/lib/instagram-api'
import { randomBytes } from 'crypto'

export async function GET() {
  const authResult = await requireAuth()
  if (authResult instanceof NextResponse) return authResult

  const state = randomBytes(16).toString('hex')
  const url = getOAuthUrl(state)

  const res = NextResponse.json({ url })
  res.cookies.set('ig_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })
  return res
}
