import type { ReactNode } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#F59E0B" />
              <path d="M16 7 L8 25 M16 7 L24 25 M11.5 19 L20.5 19" stroke="#0A0A0F" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ fontFamily: "'Big Shoulders Display', 'Arial Narrow', Impact, sans-serif", fontWeight: 900, fontSize: '1.1rem', letterSpacing: '0.05em', color: '#0A0A0F' }}>
              ABEMA <span style={{ color: '#F59E0B' }}>PM</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
            <Link href="/#fonctionnalites" className="hover:text-slate-900 transition-colors">Fonctionnalités</Link>
            <Link href="/#personas" className="hover:text-slate-900 transition-colors">Pour qui ?</Link>
            <Link href="/pricing" className="hover:text-slate-900 transition-colors">Tarifs</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Connexion</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signup">Essai gratuit</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="bg-slate-900 text-slate-400 py-10">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm">
          <p className="mb-2">
            <span className="text-white font-bold"><span className="text-blue-400">Abema</span> PM</span> — Gestion de projet PMBOK 8 avec IA
          </p>
          <p className="mb-1">Hauts-de-France · France</p>
          <p className="mb-2">© {new Date().getFullYear()} Abema Agency · <a href="mailto:agencyabema@gmail.com" className="hover:text-white transition-colors">agencyabema@gmail.com</a></p>
          <div className="flex justify-center gap-4 text-xs text-slate-500">
            <a href="/legal/mentions-legales" className="hover:text-slate-300 transition-colors">Mentions légales</a>
            <a href="/legal/politique-de-confidentialite" className="hover:text-slate-300 transition-colors">Confidentialité</a>
            <a href="/legal/cgv" className="hover:text-slate-300 transition-colors">CGV</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
