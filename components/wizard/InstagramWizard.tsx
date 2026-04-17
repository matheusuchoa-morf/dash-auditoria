'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Loader2, AtSign, FileText } from 'lucide-react'

type Step = 1 | 2
type Mode = 'handle' | 'manual'

export function InstagramWizard({ initialStep = 1 }: { initialStep?: 1 | 2 }) {
  const router = useRouter()
  const [step, setStep] = useState<Step>(initialStep)
  const [mode, setMode] = useState<Mode>('handle')

  // Handle mode
  const [handle, setHandle] = useState('')

  // Manual mode
  const [manualHandle, setManualHandle] = useState('')
  const [bio, setBio] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [captions, setCaptions] = useState(['', '', ''])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // ── Handle mode: connect via dev cookie ──────────────────────────────────
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

  async function handleRunAuditFromCookie() {
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

  // ── Manual mode: run directly with pasted data ───────────────────────────
  const manualReady = manualHandle.trim() !== '' && (bio.trim() !== '' || captions.some(c => c.trim()))

  async function handleRunManualAudit() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auditoria/instagram/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handle: manualHandle.replace('@', '').trim(),
          bio: bio.trim(),
          websiteUrl: websiteUrl.trim() || undefined,
          captions: captions.filter(c => c.trim()),
        }),
      })
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
      {/* Step indicator — only shows for handle mode step 2 */}
      {!(mode === 'manual') && (
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
      )}

      {/* ── STEP 1 ────────────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="bg-aud-bg-card border border-white/8 rounded-xl p-8">
          {/* Mode tabs */}
          <div className="flex gap-1 bg-aud-bg-elevated rounded-lg p-1 mb-6">
            <button
              type="button"
              onClick={() => { setMode('handle'); setError('') }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === 'handle' ? 'bg-aud-gold text-aud-bg-base' : 'text-aud-text-subtle hover:text-white'
              }`}
            >
              <AtSign size={14} />
              Por @handle
            </button>
            <button
              type="button"
              onClick={() => { setMode('manual'); setError('') }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === 'manual' ? 'bg-aud-gold text-aud-bg-base' : 'text-aud-text-subtle hover:text-white'
              }`}
            >
              <FileText size={14} />
              Inserir manualmente
            </button>
          </div>

          {/* ── Handle mode ── */}
          {mode === 'handle' && (
            <>
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
                {loading ? <><Loader2 size={16} className="animate-spin" /> Conectando...</> : 'Continuar'}
              </button>
            </>
          )}

          {/* ── Manual mode ── */}
          {mode === 'manual' && (
            <>
              <h2 className="text-xl font-bold text-white mb-2">Dados do Perfil</h2>
              <p className="text-aud-text-subtle text-sm mb-5">Cole as informações do Instagram — sem precisar conectar a conta</p>

              <div className="space-y-3">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-aud-text-subtle font-semibold">@</span>
                  <input
                    type="text"
                    placeholder="handle do perfil"
                    value={manualHandle}
                    onChange={e => setManualHandle(e.target.value.replace('@', ''))}
                    className="w-full bg-aud-bg-elevated border border-white/10 rounded-lg pl-8 pr-4 py-3 text-white placeholder:text-aud-text-subtle focus:outline-none focus:ring-1 focus:ring-aud-gold"
                  />
                </div>

                <textarea
                  placeholder="Bio do perfil (copie do Instagram)"
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  rows={3}
                  className="w-full bg-aud-bg-elevated border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-aud-text-subtle focus:outline-none focus:ring-1 focus:ring-aud-gold resize-none"
                />

                <input
                  type="url"
                  placeholder="Link na bio (https://...)"
                  value={websiteUrl}
                  onChange={e => setWebsiteUrl(e.target.value)}
                  className="w-full bg-aud-bg-elevated border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-aud-text-subtle focus:outline-none focus:ring-1 focus:ring-aud-gold"
                />

                <p className="text-aud-text-subtle text-xs pt-1">Legendas dos últimos posts (ao menos 1):</p>
                {captions.map((c, i) => (
                  <textarea
                    key={i}
                    placeholder={`Legenda do post ${i + 1}`}
                    value={c}
                    onChange={e => {
                      const next = [...captions]
                      next[i] = e.target.value
                      setCaptions(next)
                    }}
                    rows={2}
                    className="w-full bg-aud-bg-elevated border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-aud-text-subtle focus:outline-none focus:ring-1 focus:ring-aud-gold resize-none text-sm"
                  />
                ))}
              </div>

              {error && <p className="text-aud-danger text-sm mt-3">{error}</p>}
              <button
                onClick={handleRunManualAudit}
                disabled={!manualReady || loading}
                className="w-full mt-4 bg-aud-gold text-aud-bg-base font-semibold py-3 rounded-lg hover:bg-aud-gold-light transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? <><Loader2 size={16} className="animate-spin" /> Analisando...</> : 'Iniciar Auditoria'}
              </button>
            </>
          )}
        </div>
      )}

      {/* ── STEP 2 (only for handle mode) ───────────────────────────────── */}
      {step === 2 && (
        <div className="bg-aud-bg-card border border-white/8 rounded-xl p-8 text-center">
          <CheckCircle size={40} className="text-aud-success mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Perfil confirmado!</h2>
          <p className="text-aud-text-subtle text-sm mb-1">Iniciando análise das 4 camadas estratégicas</p>
          <p className="text-aud-gold font-mono text-sm mb-6">@{handle || '...'}</p>
          <button
            onClick={handleRunAuditFromCookie}
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
