import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: {
    default: 'Abema PM — Gestion de projet PMBOK 8',
    template: '%s | Abema PM',
  },
  description: 'Outil de gestion de projet bâti sur le référentiel PMBOK 8, avec un copilote IA natif pour les artisans, chefs de projet et dirigeants.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} h-full antialiased`}>
      <body className="h-full font-sans">{children}</body>
    </html>
  )
}
