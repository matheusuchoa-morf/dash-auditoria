import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (
    pathname.startsWith('/api') ||
    pathname === '/login' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) return NextResponse.next()

  const userId = req.cookies.get('mock_user_id')?.value
  if (userId) return NextResponse.next()

  const loginUrl = req.nextUrl.clone()
  loginUrl.pathname = '/login'
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
