'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    setLoading(false)
    if (res.ok) {
      router.push('/')
    } else {
      setError('Credenciais inválidas')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-aud-bg-base">
      <div className="w-full max-w-sm bg-aud-bg-card border border-white/10 rounded-xl p-8">
        <h1 className="text-2xl font-bold text-aud-gold mb-2">Dash Auditoria</h1>
        <p className="text-aud-text-subtle text-sm mb-6">Faça login para continuar</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="bg-aud-bg-elevated border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-aud-text-subtle focus:outline-none focus:ring-1 focus:ring-aud-gold"
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="bg-aud-bg-elevated border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-aud-text-subtle focus:outline-none focus:ring-1 focus:ring-aud-gold"
          />
          {error && <p className="text-aud-danger text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-aud-gold text-aud-bg-base font-semibold rounded-lg py-2.5 hover:bg-aud-gold-light transition-colors disabled:opacity-60"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
