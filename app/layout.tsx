import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Dash Auditoria',
  description: 'Plataforma de auditoria de Instagram e páginas de venda',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body>{children}</body>
    </html>
  )
}
