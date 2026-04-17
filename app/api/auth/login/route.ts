import { NextRequest, NextResponse } from 'next/server'
import { getMockUsers } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  const user = getMockUsers().find(u => u.email === email)
  if (!user || password !== process.env.DASHBOARD_PASSWORD) {
    return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true, role: user.role })
  res.cookies.set('mock_user_id', user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8,
    path: '/',
  })
  return res
}
