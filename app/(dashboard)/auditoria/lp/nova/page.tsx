import { LPWizard } from '@/components/wizard/LPWizard'

export default function NovaAuditoriaLPPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Nova Auditoria de Landing Page</h1>
      <p className="text-aud-text-subtle mb-8">Análise CRO da sua página de vendas</p>
      <LPWizard />
    </div>
  )
}
