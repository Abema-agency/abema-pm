export const PROJECT_SECTORS = [
  { value: 'construction', label: 'Construction & BTP' },
  { value: 'it_software', label: 'IT & Logiciel' },
  { value: 'marketing_events', label: 'Marketing & Événements' },
  { value: 'rd_innovation', label: 'R&D & Innovation' },
  { value: 'transformation', label: 'Transformation organisationnelle' },
  { value: 'product_launch', label: 'Lancement produit' },
  { value: 'regulatory_public', label: 'Réglementaire & Secteur public' },
  { value: 'other', label: 'Autre' },
] as const

export const RISK_CATEGORIES = [
  { value: 'technical', label: 'Technique' },
  { value: 'organizational', label: 'Organisationnel' },
  { value: 'external', label: 'Externe' },
  { value: 'project_management', label: 'Management de projet' },
  { value: 'commercial', label: 'Commercial' },
] as const

export const RISK_STRATEGIES_THREAT = [
  { value: 'avoid', label: 'Éviter' },
  { value: 'transfer', label: 'Transférer' },
  { value: 'mitigate', label: 'Atténuer' },
  { value: 'accept', label: 'Accepter' },
  { value: 'escalate', label: 'Escalader' },
] as const

export const RISK_STRATEGIES_OPPORTUNITY = [
  { value: 'exploit', label: 'Exploiter' },
  { value: 'share', label: 'Partager' },
  { value: 'enhance', label: 'Améliorer' },
  { value: 'accept', label: 'Accepter' },
] as const

export const STAKEHOLDER_ATTITUDES = [
  { value: 'champion', label: 'Champion' },
  { value: 'supportive', label: 'Favorable' },
  { value: 'neutral', label: 'Neutre' },
  { value: 'resistant', label: 'Résistant' },
  { value: 'blocker', label: 'Bloquant' },
] as const

export const STAKEHOLDER_ENGAGEMENT_LEVELS = [
  { value: 'unaware', label: 'Non informé' },
  { value: 'resistant', label: 'Résistant' },
  { value: 'neutral', label: 'Neutre' },
  { value: 'supportive', label: 'Favorable' },
  { value: 'leading', label: 'Moteur' },
] as const

export const RAG_COLORS = {
  green: { bg: 'bg-green-500', text: 'text-green-700', label: 'Vert' },
  amber: { bg: 'bg-amber-500', text: 'text-amber-700', label: 'Amber' },
  red: { bg: 'bg-red-500', text: 'text-red-700', label: 'Rouge' },
} as const

export function getRiskScoreColor(score: number): string {
  if (score <= 4) return 'bg-green-100 text-green-800'
  if (score <= 9) return 'bg-yellow-100 text-yellow-800'
  if (score <= 16) return 'bg-orange-100 text-orange-800'
  return 'bg-red-100 text-red-800'
}

export const PMBOK_PERFORMANCE_DOMAINS = [
  'Parties prenantes',
  'Équipe',
  'Approche de développement',
  'Planification',
  'Travail projet',
  'Livraison',
  'Mesure',
  'Incertitude',
] as const
