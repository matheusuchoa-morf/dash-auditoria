// Fill tomorrow after connecting Supabase credentials.
// Swap mockRepository for supabaseRepository in lib/db/index.ts.
import type { AuditRepository } from './repository'

export const supabaseRepository: AuditRepository = {
  async getInstagramAudits(_userId) { throw new Error('Supabase not configured yet') },
  async getInstagramAudit(_id) { throw new Error('Supabase not configured yet') },
  async saveInstagramAudit(_audit) { throw new Error('Supabase not configured yet') },
  async getLPAudits(_userId) { throw new Error('Supabase not configured yet') },
  async getLPAudit(_id) { throw new Error('Supabase not configured yet') },
  async saveLPAudit(_audit) { throw new Error('Supabase not configured yet') },
  async getAllStudentsLatestAudit() { throw new Error('Supabase not configured yet') },
}
