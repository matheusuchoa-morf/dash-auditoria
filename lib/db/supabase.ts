import { createClient } from '@supabase/supabase-js'
import type { AuditRepository } from './repository'
import type { InstagramAudit, LPAudit, StudentSummary } from '@/types/audit'

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('[supabase] NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set')
  return createClient(url, key)
}

function toInstagramAudit(row: Record<string, unknown>): InstagramAudit {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    createdAt: new Date(row.created_at as string),
    instagramHandle: row.instagram_handle as string,
    tier: row.tier as InstagramAudit['tier'],
    overallScore: row.overall_score as number,
    layers: row.layers as InstagramAudit['layers'],
    kpis: row.kpis as InstagramAudit['kpis'],
    aiSummary: row.ai_summary as string,
  }
}

function toStudentSummary(row: Record<string, unknown>): StudentSummary {
  return {
    userId: row.user_id as string,
    email: row.email as string,
    instagramHandle: row.instagram_handle as string,
    tier: row.tier as StudentSummary['tier'],
    overallScore: row.overall_score as number,
    lastAuditDate: new Date(row.last_audit_date as string),
    totalAudits: Number(row.total_audits),
  }
}

export const supabaseRepository: AuditRepository = {
  async getInstagramAudits(userId) {
    const { data, error } = await getClient()
      .from('instagram_audits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []).map(toInstagramAudit)
  },

  async getInstagramAudit(id) {
    const { data, error } = await getClient()
      .from('instagram_audits')
      .select('*')
      .eq('id', id)
      .single()
    if (error) return null
    return toInstagramAudit(data as Record<string, unknown>)
  },

  async saveInstagramAudit(audit) {
    const { data, error } = await getClient()
      .from('instagram_audits')
      .insert({
        user_id: audit.userId,
        instagram_handle: audit.instagramHandle,
        tier: audit.tier,
        overall_score: audit.overallScore,
        layers: audit.layers,
        kpis: audit.kpis,
        ai_summary: audit.aiSummary,
      })
      .select()
      .single()
    if (error) throw error
    return toInstagramAudit(data as Record<string, unknown>)
  },

  async getLPAudits(userId) {
    const { data, error } = await getClient()
      .from('lp_audits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []).map(row => ({
      id: row.id,
      userId: row.user_id,
      createdAt: new Date(row.created_at),
      pageUrl: row.page_url,
      croScore: row.cro_score,
      findings: row.findings,
      recommendations: row.recommendations,
      aiSummary: row.ai_summary,
    })) as LPAudit[]
  },

  async getLPAudit(id) {
    const { data, error } = await getClient()
      .from('lp_audits')
      .select('*')
      .eq('id', id)
      .single()
    if (error) return null
    return {
      id: data.id,
      userId: data.user_id,
      createdAt: new Date(data.created_at),
      pageUrl: data.page_url,
      croScore: data.cro_score,
      findings: data.findings,
      recommendations: data.recommendations,
      aiSummary: data.ai_summary,
    } as LPAudit
  },

  async saveLPAudit(audit) {
    const { data, error } = await getClient()
      .from('lp_audits')
      .insert({
        user_id: audit.userId,
        page_url: audit.pageUrl,
        cro_score: audit.croScore,
        findings: audit.findings,
        recommendations: audit.recommendations,
        ai_summary: audit.aiSummary,
      })
      .select()
      .single()
    if (error) throw error
    return {
      id: data.id,
      userId: data.user_id,
      createdAt: new Date(data.created_at),
      pageUrl: data.page_url,
      croScore: data.cro_score,
      findings: data.findings,
      recommendations: data.recommendations,
      aiSummary: data.ai_summary,
    } as LPAudit
  },

  async getAllStudentsLatestAudit(): Promise<StudentSummary[]> {
    const { data, error } = await getClient().rpc('get_students_latest_audit')
    if (error) throw error
    return (data ?? []).map(toStudentSummary)
  },
}
