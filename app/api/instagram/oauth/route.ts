import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForToken, encryptToken } from '@/lib/instagram-api'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const authResult = await requireAuth()
  if (authResult instanceof NextResponse) return authResult

  const { searchParams } = req.nextUrl
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  // CSRF check: verify state matches what we stored in the session cookie
  const storedState = req.cookies.get('ig_oauth_state')?.value
  if (!storedState || state !== storedState) {
    return NextResponse.redirect(new URL('/auditoria/instagram/nova?error=invalid_state', req.url))
  }

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
    // Clear the used state cookie
    res.cookies.delete('ig_oauth_state')
    return res
  } catch {
    return NextResponse.redirect(new URL('/auditoria/instagram/nova?error=token_exchange', req.url))
  }
}
