import { CriativoWizard } from '@/components/wizard/CriativoWizard'

export default function NovaCriativoPage() {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-2">Auditoria de Criativo</h1>
      <p className="text-aud-text-subtle mb-8">Análise da estrutura de atenção do seu anúncio ou post</p>
      <CriativoWizard />
    </div>
  )
}
