'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Loader2, Zap } from 'lucide-react'

type Step = 1 | 2
type Format = 'reels' | 'carrossel' | 'estatico'

const FORMAT_LABELS: Record<Format, string> = {
  reels: 'Reels / Vídeo',
  carrossel: 'Carrossel',
  estatico: 'Estático',
}

export function CriativoWizard() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [url, setUrl] = useState('')
  const [caption, setCaption] = useState('')
  const [format, setFormat] = useState<Format>('reels')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const canContinue = url.trim() !== '' || caption.trim() !== ''

  async function handleRunAnalysis() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auditoria/criativo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() || null, caption: caption.trim() || null, format }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      sessionStorage.setItem(`criativo-${data.audit.id}`, JSON.stringify(data.audit))
      router.push(`/auditoria/criativo/${data.audit.id}`)
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
          <Zap size={40} className="text-aud-gold mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Criativo a Auditar</h2>
          <p className="text-aud-text-subtle text-sm mb-6">Cole a URL do post ou descreva o criativo</p>

          {/* Format selector */}
          <div className="flex gap-2 mb-4">
            {(Object.keys(FORMAT_LABELS) as Format[]).map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setFormat(f)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                  format === f ? 'bg-aud-gold text-aud-bg-base' : 'bg-aud-bg-elevated text-aud-text-subtle border border-white/10 hover:text-white'
                }`}
              >
                {FORMAT_LABELS[f]}
              </button>
            ))}
          </div>

          <input
            type="url"
            placeholder="URL do post (opcional)"
            value={url}
            onChange={e => setUrl(e.target.value)}
            className="w-full bg-aud-bg-elevated border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-aud-text-subtle focus:outline-none focus:ring-1 focus:ring-aud-gold mb-3"
          />

          <textarea
            placeholder="Descreva o criativo ou cole o texto do post (opcional)"
            value={caption}
            onChange={e => setCaption(e.target.value)}
            rows={4}
            className="w-full bg-aud-bg-elevated border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-aud-text-subtle focus:outline-none focus:ring-1 focus:ring-aud-gold mb-4 resize-none"
          />

          <button
            onClick={() => canContinue && setStep(2)}
            disabled={!canContinue}
            className="w-full bg-aud-gold text-aud-bg-base font-semibold py-3 rounded-lg hover:bg-aud-gold-light transition-colors disabled:opacity-60"
          >
            Continuar
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="bg-aud-bg-card border border-white/8 rounded-xl p-8">
          <h2 className="text-xl font-bold text-white mb-2">Confirmar Análise</h2>
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-aud-text-subtle">Formato</span>
              <span className="text-white font-medium">{FORMAT_LABELS[format]}</span>
            </div>
            {url && <div className="flex justify-between text-sm gap-4">
              <span className="text-aud-text-subtle shrink-0">URL</span>
              <span className="text-aud-gold font-mono text-xs break-all">{url}</span>
            </div>}
            {caption && <div className="flex justify-between text-sm gap-4">
              <span className="text-aud-text-subtle shrink-0">Texto</span>
              <span className="text-white text-xs line-clamp-2">{caption}</span>
            </div>}
          </div>
          <p className="text-aud-text-subtle text-sm mb-6">A IA avaliará: Gancho (0–60), Desenvolvimento (0–30) e CTA (0–10) + recomendações de plataforma.</p>
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 border border-white/10 text-white py-3 rounded-lg hover:bg-white/5">Voltar</button>
            <button onClick={handleRunAnalysis} disabled={loading} className="flex-1 bg-aud-gold text-aud-bg-base font-semibold py-3 rounded-lg hover:bg-aud-gold-light disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Analisando...</> : 'Iniciar Análise'}
            </button>
          </div>
          {error && <p className="text-aud-danger text-sm mt-4">{error}</p>}
        </div>
      )}
    </div>
  )
}
