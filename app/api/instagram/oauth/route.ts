import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForToken, encryptToken } from '@/lib/instagram-api'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const authResult = await requireAuth()
  if (authResult instanceof NextResponse) return authResult

  const { searchParams } = req.nextUrl
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(new URL('/auditoria/instagram/nova?error=oauth_denied', req.url))
  }

  try {
    const token = await exchangeCodeForToken(code)
    const encrypted = encryptToken(token)
    const res = NextResponse.redirect(new URL('/auditoria/instagram/nova?step=2', req.url))
    res.cookies.set('ig_token_enc', encrypted, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600,
      path: '/',
    })
    return res
  } catch {
    return NextResponse.redirect(new URL('/auditoria/instagram/nova?error=token_exchange', req.url))
  }
}
