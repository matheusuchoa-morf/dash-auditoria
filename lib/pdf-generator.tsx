import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { InstagramAudit } from '@/types/audit'

const TIER_LABELS: Record<InstagramAudit['tier'], string> = {
  bronze: 'Bronze',
  prata: 'Prata',
  ouro: 'Ouro',
  platina: 'Platina',
}

const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: '#0F1015', color: '#FFFFFF', fontFamily: 'Helvetica' },
  header: { marginBottom: 24 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#C9A45A', marginBottom: 4 },
  subtitle: { fontSize: 12, color: '#8A9BA0' },
  score: { fontSize: 48, fontWeight: 'bold', color: '#C9A45A', textAlign: 'right' },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#EFEFEF', marginTop: 20, marginBottom: 8 },
  card: { backgroundColor: '#1A1C23', borderRadius: 8, padding: 12, marginBottom: 8 },
  label: { fontSize: 10, color: '#8A9BA0', marginBottom: 2 },
  value: { fontSize: 12, color: '#FFFFFF' },
  feedback: { fontSize: 11, color: '#EFEFEF', lineHeight: 1.5 },
})

export function AuditPDFDocument({ audit }: { audit: InstagramAudit }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Auditoria Instagram — @{audit.instagramHandle}</Text>
          <Text style={styles.subtitle}>
            {audit.createdAt.toLocaleDateString('pt-BR')} · Tier: {TIER_LABELS[audit.tier]}
          </Text>
        </View>

        <Text style={styles.score}>{audit.overallScore}/100</Text>

        <Text style={styles.sectionTitle}>Parecer Geral</Text>
        <View style={styles.card}>
          <Text style={styles.feedback}>{audit.aiSummary}</Text>
        </View>

        <Text style={styles.sectionTitle}>Camada 1 — Fundamentos de Autoridade</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Score: {audit.layers.authority.score}/100</Text>
          <Text style={styles.feedback}>{audit.layers.authority.feedback}</Text>
        </View>

        <Text style={styles.sectionTitle}>Camada 2 — Performance</Text>
        <View style={styles.card}>
          <Text style={styles.label}>
            Tier: {TIER_LABELS[audit.layers.performance.tier]} · {audit.layers.performance.postsPerWeek} posts/semana
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Camada 3 — Estrutura de Negócio</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Score: {audit.layers.business.score}/100</Text>
          <Text style={styles.feedback}>{audit.layers.business.feedback}</Text>
        </View>

        <Text style={styles.sectionTitle}>Camada 4 — Engenharia de Atenção</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Score médio: {audit.layers.attention.averageScore}/100</Text>
        </View>
      </Page>
    </Document>
  )
}
