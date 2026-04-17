import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { UserRole } from '@/types/audit'

export interface AuthUser { id: string; email: string; role: UserRole }

function getSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('[supabase-auth] env vars not set')
  return { url, key }
}

export async function requireAuth(): Promise<{ user: AuthUser } | NextResponse> {
  const { url, key } = getSupabaseUrl()
  const cookieStore = await cookies()
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        )
      },
    },
  })
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
