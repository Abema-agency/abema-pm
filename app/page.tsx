import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Bot, BarChart3, Shield, Zap, Users, AlertTriangle } from 'lucide-react'

export const metadata = {
  title: 'Abema PM — Gestion de projet PMBOK 8 avec IA',
  description: 'Contrairement à Asana ou Monday, Abema PM est bâti sur le référentiel PMBOK 8. Tailoring engine, copilote IA, matrice risques, registre parties prenantes.',
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
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

      <main className="flex-1">
        {/* Hero */}
        <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-blue-600/20 text-blue-300 border-blue-600/30 text-xs px-3 py-1">
              Bâti sur PMBOK 8 · Nov 2025
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              L&apos;outil de gestion de projet<br />
              <span className="text-blue-400">avec un copilote IA PMBOK 8</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
              Contrairement à Asana ou Monday, Abema PM est bâti sur le référentiel PMBOK 8.
              Il adapte automatiquement votre approche (prédictif/agile/hybride) et génère vos artefacts PM essentiels.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white px-8" asChild>
                <Link href="/signup">Commencer gratuitement</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700" asChild>
                <Link href="/login">Se connecter</Link>
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-4">Gratuit pour toujours · Sans carte bancaire · Données EU Frankfurt</p>
          </div>
        </section>

        {/* Comparison table */}
        <section className="py-16 px-4 bg-white" id="fonctionnalites">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-slate-900 mb-3">Pourquoi Abema PM ?</h2>
            <p className="text-center text-slate-500 mb-10">Ce que les autres ne font pas.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="text-left py-3 px-4 text-slate-500 font-medium">Fonctionnalité</th>
                    <th className="text-center py-3 px-4 font-bold text-blue-600">Abema PM</th>
                    <th className="text-center py-3 px-4 text-slate-500">Asana</th>
                    <th className="text-center py-3 px-4 text-slate-500">Monday</th>
                    <th className="text-center py-3 px-4 text-slate-500">ClickUp</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Tailoring engine PMBOK 8', true, false, false, false],
                    ['Copilote IA contextuel', true, false, false, false],
                    ['Génération artefacts PM (charte, WBS, risques)', true, false, false, false],
                    ['Matrice risques P×I intégrée', true, false, false, false],
                    ['Registre parties prenantes PMBOK', true, false, false, false],
                    ['Approche prédictif/agile/hybride auto-détectée', true, false, false, false],
                    ['Kanban + Liste', true, true, true, true],
                    ['Hébergement EU (RGPD)', true, false, false, false],
                  ].map(([feature, ...cols], i) => (
                    <tr key={i} className="border-b border-slate-100">
                      <td className="py-3 px-4 text-slate-700">{String(feature)}</td>
                      {cols.map((has, j) => (
                        <td key={j} className="py-3 px-4 text-center">
                          {has
                            ? <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                            : <span className="text-slate-200">—</span>
                          }
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Personas */}
        <section className="py-16 px-4 bg-slate-50" id="personas">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-slate-900 mb-10">Pour qui ?</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: '🔧',
                  title: 'Artisan / TPE',
                  subtitle: 'Karim, plombier',
                  color: 'border-amber-400',
                  benefits: [
                    'Interface mobile-first simplifiée',
                    'Vocabulaire du quotidien, pas du jargon',
                    'Suivi chantier avec IA, sans formation',
                    'Devis & délais maîtrisés',
                  ],
                },
                {
                  icon: '📊',
                  title: 'Chef de projet',
                  subtitle: 'Sophie, PM certifiée',
                  color: 'border-blue-500',
                  benefits: [
                    'PMBOK 8 complet — tous les artefacts',
                    'Registre risques avec matrice P×I',
                    'EVM, variance schedule/cost (V2)',
                    'Exports formels PDF (V2)',
                  ],
                },
                {
                  icon: '🏢',
                  title: 'Dirigeant PME',
                  subtitle: 'Jean-Marc, DG',
                  color: 'border-green-500',
                  benefits: [
                    'Dashboard exécutif multi-projets',
                    "Statuts RAG (vert/amber/rouge) en un coup d'œil",
                    'Copilote IA pour décisions rapides',
                    'Risques critiques remontés auto',
                  ],
                },
              ].map((persona, i) => (
                <div key={i} className={`bg-white rounded-xl border-t-4 ${persona.color} p-6 shadow-sm`}>
                  <div className="text-3xl mb-3">{persona.icon}</div>
                  <h3 className="font-bold text-slate-900 text-lg">{persona.title}</h3>
                  <p className="text-sm text-slate-500 mb-4">{persona.subtitle}</p>
                  <ul className="space-y-2">
                    {persona.benefits.map((b, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-slate-700">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features grid */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-slate-900 mb-10">Fonctionnalités clés</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Bot, title: 'Copilote IA PMBOK 8', desc: 'Posez vos questions, générez vos artefacts, obtenez des suggestions de risques — tout en contexte projet.' },
                { icon: Zap, title: 'Tailoring Engine', desc: '5 questions → approche recommandée (prédictif/agile/hybride) avec rationale basé sur PMBOK 8.' },
                { icon: AlertTriangle, title: 'Registre risques visuel', desc: 'Matrice P×I en temps réel, scores colorés, stratégies de réponse PMBOK 8 complètes.' },
                { icon: Users, title: 'Parties prenantes PMBOK', desc: "Registre complet + matrice Pouvoir/Intérêt SVG. Attitudes et niveaux d'engagement trackés." },
                { icon: BarChart3, title: 'Artefacts IA', desc: 'Charte projet, WBS, plan comm, leçons apprises — générés par Claude en JSON structuré.' },
                { icon: Shield, title: 'Sécurité & RGPD', desc: 'Hébergement EU Frankfurt, RLS Supabase, données cloisonnées par organisation.' },
              ].map(({ icon: Icon, title, desc }, i) => (
                <div key={i} className="p-5 rounded-xl border border-slate-200 hover:border-blue-200 hover:shadow-sm transition-all">
                  <Icon className="w-8 h-8 text-blue-600 mb-3" />
                  <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
                  <p className="text-sm text-slate-500">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4 bg-blue-600 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Prêt à structurer vos projets ?</h2>
          <p className="text-blue-200 mb-8 max-w-lg mx-auto">
            Créez votre compte gratuit en 30 secondes. Votre premier projet est configuré en 3 minutes.
          </p>
          <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 px-10" asChild>
            <Link href="/signup">Commencer gratuitement</Link>
          </Button>
        </section>
      </main>

      {/* Footer */}
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
