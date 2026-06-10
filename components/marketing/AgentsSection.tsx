'use client'

import { useState } from 'react'
import Link from 'next/link'

const PLAN_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Lite:  { bg: 'rgba(34,197,94,0.12)',   text: '#22c55e', border: 'rgba(34,197,94,0.25)' },
  Solo:  { bg: 'rgba(245,158,11,0.12)',  text: '#F59E0B', border: 'rgba(245,158,11,0.25)' },
  Pro:   { bg: 'rgba(59,130,246,0.12)',  text: '#3B82F6', border: 'rgba(59,130,246,0.25)' },
  Team:  { bg: 'rgba(168,85,247,0.12)',  text: '#A855F7', border: 'rgba(168,85,247,0.25)' },
}

const AGENTS_CATEGORIES = [
  {
    id: 'copilote',
    label: 'Copilote & Méthodo',
    color: '#F59E0B',
    agents: [
      { name: 'Tailoring Engine PMBOK 8',     plan: 'Lite', status: 'live', description: '5 questions → approche recommandée' },
      { name: 'Copilote IA contextuel',        plan: 'Lite', status: 'live', description: 'Questions projet, artefacts, suggestions' },
      { name: 'Prévision dépassement délais',  plan: 'Pro',  status: 'live', description: 'SPI trend → alerte proactive' },
      { name: 'Prévision dépassement budget',  plan: 'Pro',  status: 'live', description: 'CPI + EAC projection automatique' },
      { name: 'EVM Avancé hebdo',              plan: 'Pro',  status: 'live', description: 'BAC/SV/CV/TCPI rapport vendredi' },
    ],
  },
  {
    id: 'artefacts',
    label: 'Génération Artefacts',
    color: '#3B82F6',
    agents: [
      { name: 'Charte projet IA',       plan: 'Solo', status: 'live', description: 'Génère charte complète en JSON structuré' },
      { name: 'WBS automatique',        plan: 'Solo', status: 'live', description: 'Décomposition livrables par phase' },
      { name: 'Plan de communication',  plan: 'Pro',  status: 'live', description: 'Matrice parties prenantes + fréquence' },
      { name: 'Leçons apprises',        plan: 'Pro',  status: 'live', description: 'Capitalisation fin de phase' },
      { name: 'Exports PDF formels',    plan: 'Pro',  status: 'soon', description: 'Rapports PDF branded V2' },
    ],
  },
  {
    id: 'risques',
    label: 'Gestion des Risques',
    color: '#EF4444',
    agents: [
      { name: 'Registre risques visuel',      plan: 'Lite', status: 'live', description: 'Matrice P×I temps réel' },
      { name: 'Alertes risques proactives',   plan: 'Solo', status: 'live', description: 'Détecte risques sans review 7j' },
      { name: 'Suggestions risques IA',       plan: 'Solo', status: 'live', description: 'Anticipe risques selon contexte projet' },
      { name: 'Stratégies de réponse PMBOK',  plan: 'Pro',  status: 'live', description: 'Éviter/transférer/atténuer/accepter' },
      { name: 'Monte Carlo simplifié',        plan: 'Team', status: 'soon', description: 'Simulation probabiliste délais/coûts' },
    ],
  },
  {
    id: 'suivi',
    label: 'Suivi & Performance',
    color: '#22c55e',
    agents: [
      { name: 'Status Report hebdomadaire',  plan: 'Solo', status: 'live', description: 'Rapport PMBOK 8 auto chaque lundi' },
      { name: 'Rapport exécutif Team',       plan: 'Team', status: 'live', description: 'Multi-projets vendredi 17h' },
      { name: 'Dashboard KPIs EVM',          plan: 'Lite', status: 'live', description: 'SPI, CPI, RAG auto-calculés' },
      { name: 'Variance schedule/cost V2',   plan: 'Pro',  status: 'soon', description: 'Analyse écarts avancée' },
      { name: 'Milestone tracker',           plan: 'Solo', status: 'live', description: 'Suivi jalons avec alertes dépassement' },
    ],
  },
  {
    id: 'reunions',
    label: 'Réunions & Collaboration',
    color: '#A855F7',
    agents: [
      { name: 'Compte-rendu réunion IA',          plan: 'Pro',  status: 'live', description: 'Notes brutes → CR structuré PMBOK 8' },
      { name: 'Ordre du jour automatique',         plan: 'Solo', status: 'soon', description: 'Génère OdJ depuis le backlog projet' },
      { name: 'Registre parties prenantes',        plan: 'Lite', status: 'live', description: 'Matrice Pouvoir/Intérêt SVG' },
      { name: 'Plan engagement parties prenantes', plan: 'Pro',  status: 'soon', description: 'Stratégie communication personnalisée' },
      { name: 'Décisions & RACI IA',               plan: 'Team', status: 'soon', description: 'Log décisions + matrice responsabilités' },
    ],
  },
  {
    id: 'portfolio',
    label: 'Portefeuille & Stratégie',
    color: '#06B6D4',
    agents: [
      { name: 'Onboarding email séquence',         plan: 'Lite', status: 'live', description: 'J+0/J+3/J+7 automatiques' },
      { name: 'Lead Gen Agence',                    plan: 'Team', status: 'live', description: 'Power users → conversion agence' },
      { name: 'Rapport portfolio multi-projets',    plan: 'Team', status: 'soon', description: 'Vue consolidée toutes équipes' },
      { name: 'Scoring priorisation projets',       plan: 'Team', status: 'soon', description: 'MoSCoW + valeur business' },
      { name: 'Analyse dépendances inter-projets',  plan: 'Team', status: 'soon', description: 'Détecte conflits ressources' },
    ],
  },
]

const ALL_AGENTS = AGENTS_CATEGORIES.flatMap((c) => c.agents)
const LIVE_COUNT = ALL_AGENTS.filter((a) => a.status === 'live').length
const SOON_COUNT = ALL_AGENTS.filter((a) => a.status === 'soon').length

export function AgentsSection() {
  const [selected, setSelected] = useState<string>('all')

  const visibleCategories =
    selected === 'all'
      ? AGENTS_CATEGORIES
      : AGENTS_CATEGORIES.filter((c) => c.id === selected)

  const visibleAgents = visibleCategories.flatMap((c) => c.agents)
  const visibleLive = visibleAgents.filter((a) => a.status === 'live').length

  return (
    <section
      className="py-20 px-4"
      id="agents"
      style={{ background: '#0D0D16' }}
      aria-labelledby="agents-heading"
    >
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-5 border"
            style={{ background: 'rgba(245,158,11,0.08)', color: '#F59E0B', borderColor: 'rgba(245,158,11,0.2)' }}
          >
            Différenciateur concurrentiel
          </div>
          <h2
            id="agents-heading"
            className="text-3xl font-black mb-3"
            style={{
              fontFamily: "'Big Shoulders Display', 'Arial Narrow', Impact, sans-serif",
              color: '#F0EBE0',
              letterSpacing: '0.03em',
            }}
          >
            COPILOTE IA — 30 AGENTS PMBOK 8
          </h2>
          <p className="max-w-xl mx-auto text-sm leading-relaxed" style={{ color: '#8A8070' }}>
            Du Tailoring Engine aux rapports exécutifs automatiques — une bibliothèque d&apos;agents
            IA couvrant l&apos;intégralité du référentiel PMBOK 8.
          </p>
        </div>

        {/* Stats bar */}
        <div
          className="flex flex-wrap justify-center gap-6 mb-10 py-4 rounded-xl text-sm"
          style={{ background: '#0A0A0F', border: '1px solid rgba(255,255,255,0.05)' }}
          aria-live="polite"
        >
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: '#22c55e' }}
              aria-hidden="true"
            />
            <span style={{ color: '#C4BAA6' }}>
              <span className="font-bold" style={{ color: '#22c55e' }}>{LIVE_COUNT} agents</span> live
            </span>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.12)' }} aria-hidden="true">·</span>
          <div style={{ color: '#C4BAA6' }}>
            <span className="font-bold" style={{ color: '#F59E0B' }}>{SOON_COUNT}</span> en déploiement
          </div>
          <span style={{ color: 'rgba(255,255,255,0.12)' }} aria-hidden="true">·</span>
          <div style={{ color: '#C4BAA6' }}>
            <span className="font-bold" style={{ color: '#F0EBE0' }}>6</span> catégories PMBOK 8
          </div>
        </div>

        {/* Category filters */}
        <div
          className="flex flex-wrap gap-2 mb-8"
          role="group"
          aria-label="Filtrer par catégorie"
        >
          <button
            onClick={() => setSelected('all')}
            className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={{
              background: selected === 'all' ? '#F59E0B' : 'rgba(255,255,255,0.05)',
              color: selected === 'all' ? '#0A0A0F' : '#8A8070',
              border: selected === 'all' ? '1px solid #F59E0B' : '1px solid rgba(255,255,255,0.08)',
            }}
            aria-pressed={selected === 'all'}
          >
            Tous ({ALL_AGENTS.length})
          </button>
          {AGENTS_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelected(cat.id)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{
                background: selected === cat.id ? cat.color : 'rgba(255,255,255,0.05)',
                color: selected === cat.id ? '#0A0A0F' : '#8A8070',
                border: selected === cat.id
                  ? `1px solid ${cat.color}`
                  : '1px solid rgba(255,255,255,0.08)',
              }}
              aria-pressed={selected === cat.id}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Counter */}
        {selected !== 'all' && (
          <p className="text-xs mb-6" style={{ color: '#8A8070' }} aria-live="polite">
            {visibleLive} agent{visibleLive > 1 ? 's' : ''} live dans cette catégorie
          </p>
        )}

        {/* Agents grid */}
        <div className="grid sm:grid-cols-2 gap-3">
          {visibleCategories.map((cat) =>
            cat.agents.map((agent, idx) => {
              const planStyle = PLAN_COLORS[agent.plan] ?? PLAN_COLORS['Lite']
              const isLive = agent.status === 'live'
              const isFeatured = cat.id === 'copilote' && idx < 2

              return (
                <div
                  key={`${cat.id}-${agent.name}`}
                  className="flex items-start gap-3 p-4 rounded-xl transition-opacity"
                  style={{
                    background: isFeatured ? '#0A0A0F' : '#0A0A0F',
                    border: isFeatured
                      ? '1px solid rgba(245,158,11,0.18)'
                      : '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  {/* Category color dot */}
                  <div
                    className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                    style={{ background: cat.color }}
                    aria-hidden="true"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <span
                        className="text-sm font-semibold leading-snug"
                        style={{ color: '#F0EBE0' }}
                      >
                        {agent.name}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Plan badge */}
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{
                            background: planStyle.bg,
                            color: planStyle.text,
                            border: `1px solid ${planStyle.border}`,
                          }}
                        >
                          {agent.plan}
                        </span>
                        {/* Status */}
                        {isLive ? (
                          <span
                            className="flex items-center gap-1 text-xs font-medium"
                            style={{ color: '#22c55e' }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full animate-pulse"
                              style={{ background: '#22c55e' }}
                              aria-hidden="true"
                            />
                            LIVE
                          </span>
                        ) : (
                          <span
                            className="flex items-center gap-1 text-xs"
                            style={{ color: '#8A8070' }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ background: '#8A8070' }}
                              aria-hidden="true"
                            />
                            Bientôt
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: '#8A8070' }}>
                      {agent.description}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Plan legend */}
        <div
          className="flex flex-wrap gap-4 mt-8 pt-6"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <span className="text-xs" style={{ color: '#8A8070' }}>Plans :</span>
          {Object.entries(PLAN_COLORS).map(([plan, style]) => (
            <span key={plan} className="flex items-center gap-1.5 text-xs" style={{ color: '#8A8070' }}>
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: style.text }}
                aria-hidden="true"
              />
              {plan}
            </span>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-sm font-bold transition-opacity hover:opacity-90"
            style={{ background: '#F59E0B', color: '#0A0A0F' }}
          >
            Voir tous les agents en action →
          </Link>
          <Link
            href="/#pricing"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-sm font-semibold transition-colors hover:bg-white/5"
            style={{ color: '#C4BAA6', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            Comparer les plans
          </Link>
        </div>

      </div>
    </section>
  )
}
