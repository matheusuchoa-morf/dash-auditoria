'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Globe, CheckCircle, Loader2 } from 'lucide-react'

type Step = 1 | 2 | 3

export function LPWizard() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleRunAudit() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auditoria/lp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push(`/auditoria/lp/${data.audit.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro inesperado')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-8">
        {([1, 2, 3] as Step[]).map(n => (
          <div key={n} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              n < step ? 'bg-aud-success text-white' : n === step ? 'bg-aud-gold text-aud-bg-base' : 'bg-white/10 text-aud-text-subtle'
            }`}>
              {n < step ? <CheckCircle size={16} /> : n}
            </div>
            {n < 3 && <div className={`flex-1 h-0.5 w-16 ${n < step ? 'bg-aud-success' : 'bg-white/10'}`} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="bg-aud-bg-card border border-white/8 rounded-xl p-8">
          <Globe size={40} className="text-aud-gold mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">URL da Página</h2>
          <p className="text-aud-text-subtle text-sm mb-6">Informe a URL da sua página de vendas ou landing page</p>
          <input
            type="url"
            placeholder="https://suapagina.com/vendas"
            value={url}
            onChange={e => setUrl(e.target.value)}
            className="w-full bg-aud-bg-elevated border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-aud-text-subtle focus:outline-none focus:ring-1 focus:ring-aud-gold mb-4"
          />
          <button
            onClick={() => url && setStep(2)}
            disabled={!url}
            className="bg-aud-gold text-aud-bg-base font-semibold px-6 py-3 rounded-lg hover:bg-aud-gold-light transition-colors disabled:opacity-60 w-full"
          >
            Continuar
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="bg-aud-bg-card border border-white/8 rounded-xl p-8">
          <h2 className="text-xl font-bold text-white mb-2">Confirmar Análise</h2>
          <p className="text-aud-text-subtle text-sm mb-2">Página a ser auditada:</p>
          <p className="text-aud-gold font-mono text-sm mb-6 break-all">{url}</p>
          <p className="text-aud-text-subtle text-sm mb-6">A IA irá analisar: proposta de valor, prova social, objeções, CTAs, narrativa e experiência mobile.</p>
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 border border-white/10 text-white py-3 rounded-lg hover:bg-white/5">
              Voltar
            </button>
            <button onClick={handleRunAudit} disabled={loading} className="flex-1 bg-aud-gold text-aud-bg-base font-semibold py-3 rounded-lg hover:bg-aud-gold-light disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Analisando...</> : 'Iniciar CRO'}
            </button>
          </div>
          {error && <p className="text-aud-danger text-sm mt-4">{error}</p>}
        </div>
      )}
    </div>
  )
}
