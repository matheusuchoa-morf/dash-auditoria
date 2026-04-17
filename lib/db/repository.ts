import type { InstagramAudit, LPAudit, StudentSummary } from '@/types/audit'

export interface AuditRepository {
  getInstagramAudits(userId: string): Promise<InstagramAudit[]>
  getInstagramAudit(id: string): Promise<InstagramAudit | null>
  saveInstagramAudit(audit: Omit<InstagramAudit, 'id' | 'createdAt'>): Promise<InstagramAudit>
  getLPAudits(userId: string): Promise<LPAudit[]>
  getLPAudit(id: string): Promise<LPAudit | null>
  saveLPAudit(audit: Omit<LPAudit, 'id' | 'createdAt'>): Promise<LPAudit>
  getAllStudentsLatestAudit(): Promise<StudentSummary[]>
}
