'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Camera, Globe, Clock, Users, Home, LogOut, Zap } from 'lucide-react'

const nav = [
  { href: '/',                         label: 'Início',           icon: Home },
  { href: '/auditoria/instagram/nova', label: 'Auditar Instagram', icon: Camera },
  { href: '/auditoria/lp/nova',        label: 'Auditar LP',       icon: Globe },
  { href: '/auditoria/criativo/nova',  label: 'Auditar Criativo', icon: Zap },
  { href: '/historico',                label: 'Histórico',        icon: Clock },
  { href: '/mentor',                   label: 'Mentores',         icon: Users },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <aside className="w-60 min-h-screen bg-[var(--sidebar)] border-r border-white/6 flex flex-col">
      <div className="px-6 py-5 border-b border-white/6">
        <span className="text-aud-gold font-bold text-lg tracking-tight">Dash Auditoria</span>
      </div>
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-aud-gold/15 text-aud-gold font-medium'
                  : 'text-aud-text-subtle hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>
      <div className="px-3 py-4 border-t border-white/6">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-aud-text-subtle hover:text-aud-danger hover:bg-white/5 transition-colors w-full"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </aside>
  )
}
