import { mockRepository } from './mock'

// Tomorrow: swap to supabaseRepository when SUPABASE_URL is set
export const db = mockRepository
export type { AuditRepository } from './repository'
