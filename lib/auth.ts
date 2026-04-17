import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { MockUser, UserRole } from '@/types/audit'

const MOCK_USERS: MockUser[] = [
  { id: 'user-admin-1', email: 'admin@auditoria.com', role: 'admin' },
  { id: 'user-mentor-1', email: 'mentor@auditoria.com', role: 'mentor' },
  { id: 'user-student-1', email: 'aluno@auditoria.com', role: 'student', instagramHandle: 'joaosilva.coach' },
]

export async function requireAuth(): Promise<{ user: MockUser } | NextResponse> {
  const cookieStore = await cookies()
  const userId = cookieStore.get('mock_user_id')?.value
  if (!userId) return new NextResponse('Unauthorized', { status: 401 })
  const user = MOCK_USERS.find(u => u.id === userId)
  if (!user) return new NextResponse('Unauthorized', { status: 401 })
  return { user }
}

export async function requireRole(role: UserRole): Promise<{ user: MockUser } | NextResponse> {
  const result = await requireAuth()
  if (result instanceof NextResponse) return result
  if (result.user.role !== role && result.user.role !== 'admin') {
    return new NextResponse('Forbidden', { status: 403 })
  }
  return result
}

export function getMockUsers() { return MOCK_USERS }
