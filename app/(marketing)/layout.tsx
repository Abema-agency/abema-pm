import type { ReactNode } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            <span className="text-blue-600">Abema</span> PM
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
          <p>© {new Date().getFullYear()} Abema Agency · <a href="mailto:agencyabema@gmail.com" className="hover:text-white transition-colors">agencyabema@gmail.com</a></p>
        </div>
      </footer>
    </div>
  )
}
