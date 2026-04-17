'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Loader2 } from 'lucide-react'

type Step = 1 | 2 | 3

interface InstagramWizardProps { initialStep?: 1 | 2 }

export function InstagramWizard({ initialStep = 1 }: InstagramWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState<Step>(initialStep)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleConnectInstagram() {
    try {
      const res = await fetch('/api/instagram/oauth-url')
      if (!res.ok) throw new Error('Falha ao iniciar OAuth')
      const { url } = await res.json()
      window.location.href = url
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao conectar com Instagram')
    }
  }

  async function handleRunAudit() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auditoria/instagram', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push(`/auditoria/instagram/${data.audit.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro inesperado')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {([1, 2, 3] as Step[]).map(n => (
          <div key={n} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
              n < step ? 'bg-aud-success text-white' : n === step ? 'bg-aud-gold text-aud-bg-base' : 'bg-white/10 text-aud-text-subtle'
            }`}>
              {n < step ? <CheckCircle size={16} /> : n}
            </div>
            {n < 3 && <div className={`flex-1 h-0.5 w-16 ${n < step ? 'bg-aud-success' : 'bg-white/10'}`} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="bg-aud-bg-card border border-white/8 rounded-xl p-8 text-center">
          <div className="text-4xl mb-4">📸</div>
          <h2 className="text-xl font-bold text-white mb-2">Conectar Instagram</h2>
          <p className="text-aud-text-subtle text-sm mb-6">Autorize o acesso à sua conta para análise automática de métricas</p>
          <button onClick={handleConnectInstagram} className="bg-aud-gold text-aud-bg-base font-semibold px-6 py-3 rounded-lg hover:bg-aud-gold-light transition-colors">
            Conectar com Instagram
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="bg-aud-bg-card border border-white/8 rounded-xl p-8 text-center">
          <CheckCircle size={40} className="text-aud-success mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Conta Conectada!</h2>
          <p className="text-aud-text-subtle text-sm mb-6">Confirme para iniciar a análise completa das 4 camadas</p>
          <button onClick={handleRunAudit} disabled={loading} className="bg-aud-gold text-aud-bg-base font-semibold px-6 py-3 rounded-lg hover:bg-aud-gold-light transition-colors disabled:opacity-60 flex items-center gap-2 mx-auto">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Analisando...</> : 'Iniciar Auditoria'}
          </button>
          {error && <p className="text-aud-danger text-sm mt-4">{error}</p>}
        </div>
      )}
    </div>
  )
}
