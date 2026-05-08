import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'

const PLANS = [
  {
    name: 'Lite',
    price: '0',
    description: 'Pour démarrer et découvrir',
    features: ['3 projets actifs', 'Kanban + Liste', 'Copilote IA (20 messages/mois)', 'Tailoring engine', 'Registre risques', 'Parties prenantes'],
    cta: 'Commencer gratuitement',
    href: '/signup',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '29',
    description: 'Pour les professionnels',
    features: ['Projets illimités', 'Copilote IA illimité', 'Génération artefacts IA illimitée', 'Export PDF artefacts', 'Gantt view', 'Status reports IA', 'Support prioritaire'],
    cta: 'Commencer en Pro',
    href: '/signup?plan=pro',
    highlighted: true,
  },
  {
    name: 'Équipe',
    price: '79',
    description: 'Pour les équipes et PME',
    features: ['Tout le plan Pro', 'Jusqu\'à 10 membres', 'Rôles & permissions', 'Multi-projets dashboard', 'n8n webhooks', 'SSO (V2)', 'SLA 99.9%'],
    cta: 'Contacter l\'équipe',
    href: 'mailto:agencyabema@gmail.com',
    highlighted: false,
  },
]

export default function PricingPage() {
  return (
    <div className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-3">Tarifs simples et transparents</h1>
          <p className="text-slate-500">Commencez gratuitement. Passez au Pro quand vous avez besoin de plus.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl p-6 border ${plan.highlighted ? 'border-blue-500 shadow-lg shadow-blue-100 ring-1 ring-blue-500' : 'border-slate-200'}`}
            >
              {plan.highlighted && (
                <div className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block mb-3">
                  Recommandé
                </div>
              )}
              <h2 className="text-xl font-bold text-slate-900">{plan.name}</h2>
              <div className="mt-2 mb-1">
                <span className="text-3xl font-bold text-slate-900">{plan.price}€</span>
                {plan.price !== '0' && <span className="text-slate-500 text-sm"> /mois</span>}
              </div>
              <p className="text-sm text-slate-500 mb-6">{plan.description}</p>
              <ul className="space-y-2.5 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className={`w-full ${plan.highlighted ? 'bg-blue-600 hover:bg-blue-500' : ''}`}
                variant={plan.highlighted ? 'default' : 'outline'}
                asChild
              >
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
