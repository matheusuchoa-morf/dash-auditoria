'use client'
import { useSearchParams } from 'next/navigation'
import { InstagramWizard } from '@/components/wizard/InstagramWizard'

export default function NovaAuditoriaInstagramPage() {
  const params = useSearchParams()
  const oauthError = params.get('error')
  const initialStep = params.get('step') === '2' ? 2 : 1

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Nova Auditoria de Instagram</h1>
      <p className="text-aud-text-subtle mb-8">Análise completa das 4 camadas estratégicas</p>
      {oauthError && (
        <div className="mb-6 bg-aud-danger/10 border border-aud-danger/30 rounded-lg p-4 text-aud-danger text-sm">
          Erro ao conectar Instagram. Tente novamente.
        </div>
      )}
      <InstagramWizard initialStep={initialStep as 1 | 2} />
    </div>
  )
}
