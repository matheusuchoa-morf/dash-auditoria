'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Loader2, AtSign } from 'lucide-react'

type Step = 1 | 2

export function InstagramWizard({ initialStep = 1 }: { initialStep?: 1 | 2 }) {
  const router = useRouter()
  const [step, setStep] = useState<Step>(initialStep)
  const [handle, setHandle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Step 1: save handle → cookie via API → advance to step 2
  async function handleConnect() {
    if (!handle.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/instagram/connect-dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle: handle.replace('@', '').trim() }),
      })
      if (!res.ok) throw new Error('Falha ao salvar handle')
      setStep(2)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao conectar')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: run audit
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
        {([1, 2] as Step[]).map(n => (
          <div key={n} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
              n < step ? 'bg-aud-success text-white' : n === step ? 'bg-aud-gold text-aud-bg-base' : 'bg-white/10 text-aud-text-subtle'
            }`}>
              {n < step ? <CheckCircle size={16} /> : n}
            </div>
            {n < 2 && <div className={`flex-1 h-0.5 w-16 ${n < step ? 'bg-aud-success' : 'bg-white/10'}`} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="bg-aud-bg-card border border-white/8 rounded-xl p-8">
          <AtSign size={40} className="text-aud-gold mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Perfil do Instagram</h2>
          <p className="text-aud-text-subtle text-sm mb-6">Informe o @ do perfil a ser auditado</p>
          <div className="relative mb-4">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-aud-text-subtle font-semibold">@</span>
            <input
              type="text"
              placeholder="seuperfil"
              value={handle}
              onChange={e => setHandle(e.target.value.replace('@', ''))}
              onKeyDown={e => e.key === 'Enter' && handleConnect()}
              className="w-full bg-aud-bg-elevated border border-white/10 rounded-lg pl-8 pr-4 py-3 text-white placeholder:text-aud-text-subtle focus:outline-none focus:ring-1 focus:ring-aud-gold"
            />
          </div>
          {error && <p className="text-aud-danger text-sm mb-3">{error}</p>}
          <button
            onClick={handleConnect}
            disabled={!handle.trim() || loading}
            className="w-full bg-aud-gold text-aud-bg-base font-semibold py-3 rounded-lg hover:bg-aud-gold-light transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 size={16} className="animate-spin" /> Conectando...</> : 'Conectar'}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="bg-aud-bg-card border border-white/8 rounded-xl p-8 text-center">
          <CheckCircle size={40} className="text-aud-success mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Perfil confirmado!</h2>
          <p className="text-aud-text-subtle text-sm mb-1">Iniciando análise das 4 camadas estratégicas</p>
          <p className="text-aud-gold font-mono text-sm mb-6">@{handle || '...'}</p>
          <button
            onClick={handleRunAudit}
            disabled={loading}
            className="bg-aud-gold text-aud-bg-base font-semibold px-8 py-3 rounded-lg hover:bg-aud-gold-light transition-colors disabled:opacity-60 flex items-center gap-2 mx-auto"
          >
            {loading ? <><Loader2 size={16} className="animate-spin" /> Analisando...</> : 'Iniciar Auditoria'}
          </button>
          {error && <p className="text-aud-danger text-sm mt-4">{error}</p>}
        </div>
      )}
    </div>
  )
}
