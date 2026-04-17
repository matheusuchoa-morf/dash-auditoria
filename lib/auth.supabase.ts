import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export type UserRole = 'student' | 'mentor' | 'admin'
export interface AuthUser { id: string; email: string; role: UserRole }

export async function requireAuth(): Promise<{ user: AuthUser } | NextResponse> {
  const cookieStore = await cookies()
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        storage: {
          getItem: (key: string) => cookieStore.get(key)?.value ?? null,
          setItem: () => {},
          removeItem: () => {},
        },
      },
    }
  )
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return new NextResponse('Unauthorized', { status: 401 })
  const role = (user.user_metadata?.role ?? 'student') as UserRole
  return { user: { id: user.id, email: user.email!, role } }
}

export async function requireRole(role: UserRole): Promise<{ user: AuthUser } | NextResponse> {
  const authResult = await requireAuth()
  if (authResult instanceof NextResponse) return authResult
  if (authResult.user.role !== role && authResult.user.role !== 'admin') {
    return new NextResponse('Forbidden', { status: 403 })
  }
  return authResult
}
