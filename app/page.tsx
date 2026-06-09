import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle, Bot, BarChart3, Shield, Zap, Users, AlertTriangle } from 'lucide-react'
import { MarketingHeader } from '@/components/layout/MarketingHeader'
import { getLatestPosts } from '@/lib/blog'
import { DemoSection } from '@/components/marketing/DemoSection'

export const metadata = {
  title: 'Abema PM — Gestion de projet PMBOK 8 avec IA',
  description: 'Contrairement à Asana ou Monday, Abema PM est bâti sur le référentiel PMBOK 8. Tailoring engine, copilote IA, matrice risques, registre parties prenantes.',
}

export default function Home() {
  const latestPosts = getLatestPosts(3)
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0A0A0F', color: '#C4BAA6', fontFamily: 'Mulish, sans-serif' }}>

      <MarketingHeader />

      <main id="main-content" className="flex-1">

        {/* Hero */}
        <section className="relative py-28 px-4 overflow-hidden" style={{ background: '#0A0A0F', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
          {/* Amber glow — atténué */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 45% at 50% 35%, rgba(245,158,11,0.04) 0%, transparent 70%)' }} />

          <div className="relative z-10 max-w-4xl mx-auto text-center w-full">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-6 border" style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B', borderColor: 'rgba(245,158,11,0.25)' }}>
              Bâti sur PMBOK 8 · Nov 2025
            </div>
            <h1
              className="text-5xl md:text-6xl font-black leading-tight mb-6"
              style={{ fontFamily: "'Big Shoulders Display', 'Arial Narrow', Impact, sans-serif", color: '#F0EBE0', letterSpacing: '0.01em', textWrap: 'balance' } as React.CSSProperties}
            >
              L&apos;outil de gestion de projet{' '}
              <span style={{ color: '#F59E0B' }}>avec un copilote IA PMBOK 8</span>
            </h1>
            <p className="text-lg max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: '#C4BAA6' }}>
              Contrairement à Asana ou Monday, Abema PM est bâti sur le référentiel PMBOK 8.
              Il adapte automatiquement votre approche et génère vos artefacts PM essentiels.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-10 font-bold text-base" asChild>
                <Link href="/signup">Commencer gratuitement</Link>
              </Button>
              <Button size="lg" variant="outline" className="px-10 font-bold text-base border-white/20 text-brand-sand hover:bg-white/5 hover:text-brand-cream" asChild>
                <Link href="/login">Se connecter</Link>
              </Button>
            </div>
            <p className="text-xs mt-4" style={{ color: '#8A8070' }}>Gratuit pour toujours · Sans carte bancaire · Données EU Frankfurt</p>
          </div>
        </section>

        {/* Comparison table */}
        <section className="py-20 px-4" id="fonctionnalites" style={{ background: '#0D0D16' }}>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-black text-center mb-3" style={{ fontFamily: "'Big Shoulders Display', 'Arial Narrow', Impact, sans-serif", color: '#F0EBE0', letterSpacing: '0.03em' }}>
              POURQUOI ABEMA PM ?
            </h2>
            <p className="text-center mb-10" style={{ color: '#8A8070' }}>Ce que les autres ne font pas.</p>
            <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'rgba(240,235,224,0.06)' }}>
              <table className="w-full text-sm" style={{ background: '#07070E' }}>
                <caption className="sr-only">
                  Comparaison des fonctionnalités entre Abema PM, Asana, Monday et ClickUp
                </caption>
                <thead>
                  <tr className="border-b" style={{ borderColor: 'rgba(240,235,224,0.08)' }}>
                    <th className="text-left py-3 px-4 font-medium" style={{ color: '#8A8070' }}>Fonctionnalité</th>
                    <th className="text-center py-3 px-4 font-bold" style={{ color: '#F59E0B' }}>Abema PM</th>
                    <th className="text-center py-3 px-4" style={{ color: '#8A8070' }}>Asana</th>
                    <th className="text-center py-3 px-4" style={{ color: '#8A8070' }}>Monday</th>
                    <th className="text-center py-3 px-4" style={{ color: '#8A8070' }}>ClickUp</th>
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
                    <tr key={i} className="border-b" style={{ borderColor: 'rgba(240,235,224,0.05)' }}>
                      <td className="py-3 px-4" style={{ color: '#C4BAA6' }}>{String(feature)}</td>
                      {cols.map((has, j) => (
                        <td key={j} className="py-3 px-4 text-center">
                          {has ? (
                            <span aria-label="Disponible">
                              <CheckCircle aria-hidden="true" className="w-4 h-4 mx-auto" style={{ color: '#22c55e' }} />
                            </span>
                          ) : (
                            <span aria-label="Non disponible" style={{ color: '#2a2a35' }}>—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Démo interactive */}
        <section className="py-20 px-4" style={{ background: "#0A0A0F" }}>
          <div className="max-w-5xl mx-auto">
            <h2
              className="text-3xl font-black text-center mb-3"
              style={{
                fontFamily: "'Big Shoulders Display', 'Arial Narrow', Impact, sans-serif",
                color: "#F0EBE0",
                letterSpacing: "0.03em",
              }}
            >
              LE PRODUIT EN ACTION
            </h2>
            <p className="text-center mb-10" style={{ color: "#8A8070" }}>
              Tailoring engine, dashboard KPIs, registre risques, copilote IA — en 4 étapes.
            </p>
            <DemoSection />
          </div>
        </section>

        {/* Personas */}
        <section className="py-20 px-4" id="personas" style={{ background: '#0A0A0F' }}>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-black text-center mb-10" style={{ fontFamily: "'Big Shoulders Display', 'Arial Narrow', Impact, sans-serif", color: '#F0EBE0', letterSpacing: '0.03em' }}>
              POUR QUI ?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: '🔧',
                  title: 'Artisan / TPE',
                  subtitle: 'Karim, plombier',
                  borderColor: '#F59E0B',
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
                  borderColor: '#3B82F6',
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
                  borderColor: '#22c55e',
                  benefits: [
                    'Dashboard exécutif multi-projets',
                    "Statuts RAG (vert/amber/rouge) en un coup d'œil",
                    'Copilote IA pour décisions rapides',
                    'Risques critiques remontés auto',
                  ],
                },
              ].map((persona, i) => (
                <div key={i} className="rounded-xl p-6 border-t-4" style={{ background: '#0D0D16', borderTopColor: persona.borderColor, borderLeft: '1px solid rgba(240,235,224,0.06)', borderRight: '1px solid rgba(240,235,224,0.06)', borderBottom: '1px solid rgba(240,235,224,0.06)' }}>
                  <div className="text-3xl mb-3">{persona.icon}</div>
                  <h3 className="font-black text-lg mb-1" style={{ fontFamily: "'Big Shoulders Display', 'Arial Narrow', sans-serif", color: '#F0EBE0', letterSpacing: '0.03em' }}>{persona.title}</h3>
                  <p className="text-sm mb-4" style={{ color: '#8A8070' }}>{persona.subtitle}</p>
                  <ul className="space-y-2">
                    {persona.benefits.map((b, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm" style={{ color: '#C4BAA6' }}>
                        <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" style={{ color: '#22c55e' }} />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Blog teaser */}
        <section className="py-20 px-4" style={{ background: '#0A0A0F' }}>
          <div className="max-w-5xl mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl font-black"
                  style={{ fontFamily: "'Big Shoulders Display', 'Arial Narrow', Impact, sans-serif", color: '#F0EBE0', letterSpacing: '0.03em' }}>
                  RESSOURCES PMBOK 8
                </h2>
                <p className="mt-2" style={{ color: '#8A8070' }}>
                  Guides pratiques pour chefs de projet et dirigeants.
                </p>
              </div>
              <Link href="/blog" className="text-sm font-semibold hover:text-white transition-colors" style={{ color: '#F59E0B' }}>
                Tous les articles →
              </Link>
            </div>

            {latestPosts.length === 0 ? (
              <div className="grid md:grid-cols-3 gap-5">
                {['PMBOK 8 vs PMBOK 6 : ce qui change vraiment', 'SPI, CPI, EVM : les indicateurs clés', 'Matrice P×I : gérer les risques'].map((title, i) => (
                  <div key={i} className="p-5 rounded-xl" style={{ background: '#0D0D16', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="h-3 rounded mb-3" style={{ background: 'rgba(245,158,11,0.15)', width: '60%' }} />
                    <div className="text-sm font-bold mb-2" style={{ color: '#F0EBE0' }}>{title}</div>
                    <div className="h-2 rounded mb-1" style={{ background: 'rgba(255,255,255,0.05)', width: '90%' }} />
                    <div className="h-2 rounded" style={{ background: 'rgba(255,255,255,0.05)', width: '70%' }} />
                    <div className="mt-4 text-xs" style={{ color: '#F59E0B' }}>À venir →</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-5">
                {latestPosts.map(post => (
                  <Link key={post.slug} href={`/blog/${post.slug}`} className="block group">
                    <div className="p-5 rounded-xl transition-all h-full"
                      style={{ background: '#0D0D16', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <span className="text-xs font-semibold px-2 py-1 rounded-full mb-3 inline-block"
                        style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B' }}>
                        {post.category}
                      </span>
                      <h3 className="text-sm font-bold mb-2 group-hover:text-amber-400 transition-colors"
                        style={{ fontFamily: "'Big Shoulders Display', sans-serif", color: '#F0EBE0' }}>
                        {post.title}
                      </h3>
                      <p className="text-xs leading-relaxed line-clamp-2" style={{ color: '#8A8070' }}>
                        {post.excerpt}
                      </p>
                      <div className="mt-4 text-xs font-semibold" style={{ color: '#F59E0B' }}>
                        Lire →
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-4" style={{ background: '#0D0D16' }}>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-black text-center mb-10" style={{ fontFamily: "'Big Shoulders Display', 'Arial Narrow', Impact, sans-serif", color: '#F0EBE0', letterSpacing: '0.03em' }}>
              FONCTIONNALITÉS CLÉS
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { icon: Bot, title: 'Copilote IA PMBOK 8', desc: 'Posez vos questions, générez vos artefacts, obtenez des suggestions de risques — tout en contexte projet.' },
                { icon: Zap, title: 'Tailoring Engine', desc: '5 questions → approche recommandée (prédictif/agile/hybride) avec rationale basé sur PMBOK 8.' },
                { icon: AlertTriangle, title: 'Registre risques visuel', desc: 'Matrice P×I en temps réel, scores colorés, stratégies de réponse PMBOK 8 complètes.' },
                { icon: Users, title: 'Parties prenantes PMBOK', desc: "Registre complet + matrice Pouvoir/Intérêt SVG. Attitudes et niveaux d'engagement trackés." },
                { icon: BarChart3, title: 'Artefacts IA', desc: 'Charte projet, WBS, plan comm, leçons apprises — générés par Claude en JSON structuré.' },
                { icon: Shield, title: 'Sécurité & RGPD', desc: 'Hébergement EU Frankfurt, RLS Supabase, données cloisonnées par organisation.' },
              ].map(({ icon: Icon, title, desc }, i) =>
                i === 0 ? (
                  <div key={i} className="p-6 rounded-xl lg:col-span-2 transition-all" style={{ background: '#0D0D16', border: '1px solid rgba(245,158,11,0.2)' }}>
                    <Icon className="w-7 h-7 mb-3" aria-hidden="true" style={{ color: '#F59E0B' }} />
                    <h3 className="font-bold mb-2" style={{ color: '#F0EBE0' }}>{title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: '#8A8070' }}>{desc}</p>
                    <div className="mt-4 flex items-center gap-2 text-xs font-semibold" style={{ color: '#F59E0B' }}>
                      <span>Inclus dans tous les plans</span>
                      <span style={{ color: 'rgba(245,158,11,0.4)' }}>·</span>
                      <span>Modèle Claude d&apos;Anthropic</span>
                    </div>
                  </div>
                ) : (
                  <div key={i} className="p-5 rounded-xl transition-all group cursor-default" style={{ background: '#0A0A0F', border: '1px solid rgba(240,235,224,0.06)' }}>
                    <Icon className="w-7 h-7 mb-3" aria-hidden="true" style={{ color: '#F59E0B' }} />
                    <h3 className="font-bold mb-2" style={{ color: '#F0EBE0' }}>{title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: '#8A8070' }}>{desc}</p>
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        {/* À propos */}
        <section id="a-propos" className="py-20 px-4" style={{ background: '#0A0A0F' }}>
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">

              {/* Colonne gauche — texte */}
              <div>
                <p className="text-xs font-semibold tracking-widest mb-4" style={{ color: '#F59E0B' }}>
                  QUI SOMMES-NOUS
                </p>
                <h2
                  className="text-3xl font-black mb-6"
                  style={{ fontFamily: "'Big Shoulders Display', 'Arial Narrow', Impact, sans-serif", color: '#F0EBE0', letterSpacing: '0.03em' }}
                >
                  De chantiers à 1 500 personnes aux outils de gestion de projet IA
                </h2>
                <div className="space-y-4 text-sm leading-relaxed" style={{ color: '#C4BAA6' }}>
                  <p>
                    Je suis{' '}
                    <strong style={{ color: '#F0EBE0' }}>Abdallah Ait Essaghir</strong>,
                    fondateur d&apos;ABEMA AGENCY. Pendant plus de 15 ans, j&apos;ai piloté
                    des projets parmi les plus complexes au monde — hôtels 5 étoiles
                    (Ritz Carlton Riyadh, Radisson Blu, Barceló), un technopôle de 610 hectares
                    au Maroc, des programmes de logements en France. Des équipes jusqu&apos;à
                    1 500 personnes, des budgets sous pression.
                  </p>
                  <p>
                    Ce que j&apos;ai appris en 15 ans :{' '}
                    <strong style={{ color: '#F0EBE0' }}>la méthode fait tout.</strong> Un
                    processus bien pensé, bien exécuté, transforme le chaos en résultat —
                    quelle que soit l&apos;échelle du projet. C&apos;est exactement ce que
                    PMBOK 8 formalise.
                  </p>
                  <p>
                    Abema PM est l&apos;outil que j&apos;aurais voulu avoir sur mes chantiers.
                    Bâti sur PMBOK 8, augmenté par l&apos;IA — pour les artisans, les chefs de
                    projet certifiés et les dirigeants qui veulent structurer sans complexifier.
                  </p>
                </div>

                {/* Stats */}
                <div className="flex gap-8 mt-8">
                  {[
                    { val: '15+', label: 'ans terrain' },
                    { val: '1 500', label: 'personnes coord.' },
                    { val: '3', label: 'langues FR/AR/EN' },
                  ].map(({ val, label }) => (
                    <div key={label}>
                      <div className="text-2xl font-black" style={{ fontFamily: "'Big Shoulders Display', sans-serif", color: '#F59E0B' }}>
                        {val}
                      </div>
                      <div className="text-xs mt-1" style={{ color: '#8A8070' }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Colonne droite — card identité */}
              <div className="rounded-xl p-6 border" style={{ background: '#0D0D16', borderColor: 'rgba(240,235,224,0.08)' }}>
                {/* Avatar initiales */}
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-black mb-4"
                  style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#F59E0B', fontFamily: "'Big Shoulders Display', sans-serif" }}
                >
                  AA
                </div>

                <div className="font-black text-lg mb-1" style={{ fontFamily: "'Big Shoulders Display', sans-serif", color: '#F0EBE0' }}>
                  Abdallah Ait Essaghir
                </div>
                <div className="text-sm mb-6" style={{ color: '#8A8070' }}>
                  Fondateur, ABEMA AGENCY
                </div>

                {/* Références projets */}
                <div className="space-y-2 text-xs" style={{ color: '#8A8070' }}>
                  {[
                    'Ritz Carlton Riyadh — Hôtel 5 étoiles',
                    'Radisson Blu & Barceló',
                    'Technopôle 610 ha — Maroc',
                    'Programmes logements — France',
                  ].map((ref) => (
                    <div key={ref} className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: '#F59E0B' }} />
                      <span>{ref}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t text-xs" style={{ borderColor: 'rgba(240,235,224,0.08)', color: '#8A8070' }}>
                  <div>ABEMA AGENCY — SIREN 925 242 976</div>
                  <div>25 Rue de Rouvroy, 62680 Méricourt</div>
                  <div>Hauts-de-France, France</div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-4 text-center" style={{ background: '#F59E0B' }}>
          <h2 className="text-4xl font-black mb-4" style={{ fontFamily: "'Big Shoulders Display', 'Arial Narrow', Impact, sans-serif", color: '#0A0A0F', letterSpacing: '0.03em' }}>
            PRÊT À STRUCTURER VOS PROJETS ?
          </h2>
          <p className="mb-8 max-w-lg mx-auto" style={{ color: '#625A52' }}>
            Créez votre compte gratuit en 30 secondes. Votre premier projet est configuré en 3 minutes.
          </p>
          <Button size="lg" className="px-10 font-bold text-base" style={{ background: '#0A0A0F', color: '#F0EBE0' }} asChild>
            <Link href="/signup">Commencer gratuitement</Link>
          </Button>
        </section>

      </main>

      {/* Footer */}
      <footer className="py-10" style={{ background: '#07070E', color: '#8A8070' }}>
        <div className="max-w-6xl mx-auto px-4 text-center text-sm">
          <div className="flex justify-center mb-4">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <rect width="32" height="32" rx="8" fill="#F59E0B" />
              <path d="M16 7 L8 25 M16 7 L24 25 M11.5 19 L20.5 19" stroke="#0A0A0F" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="mb-2" style={{ color: '#C4BAA6' }}>
            <span style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, letterSpacing: '0.05em', color: '#F0EBE0' }}>ABEMA</span>{' '}
            <span style={{ color: '#F59E0B', fontWeight: 700 }}>PM</span>{' '}
            — Gestion de projet PMBOK 8 avec IA
          </p>
          <p className="mb-1">Hauts-de-France · France</p>
          <p className="mb-4">© {new Date().getFullYear()} Abema Agency · <a href="mailto:contact@abemaagency.com" className="hover:text-white transition-colors" style={{ color: '#8A8070' }}>contact@abemaagency.com</a></p>
          <div className="flex justify-center gap-4 text-xs" style={{ color: '#8A8070' }}>
            <Link href="/legal/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link>
            <Link href="/legal/politique-de-confidentialite" className="hover:text-white transition-colors">Confidentialité</Link>
            <Link href="/legal/cgv" className="hover:text-white transition-colors">CGV</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
