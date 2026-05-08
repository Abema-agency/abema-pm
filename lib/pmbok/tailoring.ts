export type TailoringQuestion = {
  id: string
  question: string
  options: { value: number; label: string }[]
  weight: { predictive: number; agile: number }
}

export const TAILORING_QUESTIONS: TailoringQuestion[] = [
  {
    id: 'requirements_stability',
    question: 'Les exigences du projet sont-elles bien définies et stables ?',
    options: [
      { value: 1, label: "Non, elles vont évoluer constamment" },
      { value: 3, label: "Partiellement — certaines sont fixes, d'autres évoluent" },
      { value: 5, label: "Oui, elles sont clairement définies et ne bougeront pas" },
    ],
    weight: { predictive: 1, agile: -1 },
  },
  {
    id: 'deliverable_divisibility',
    question: 'Le livrable peut-il être découpé en incréments indépendants ?',
    options: [
      { value: 1, label: "Non, c'est tout ou rien (ex: un pont, un bâtiment)" },
      { value: 3, label: "Partiellement" },
      { value: 5, label: "Oui, facilement (ex: fonctionnalités logicielles, contenus)" },
    ],
    weight: { predictive: -1, agile: 1 },
  },
  {
    id: 'stakeholder_availability',
    question: 'Tes parties prenantes sont-elles disponibles pour collaborer régulièrement ?',
    options: [
      { value: 1, label: "Non, seulement pour les validations formelles" },
      { value: 3, label: "De temps en temps" },
      { value: 5, label: "Oui, elles peuvent s'impliquer en continu" },
    ],
    weight: { predictive: -1, agile: 1 },
  },
  {
    id: 'change_cost',
    question: "Quel est le coût d'un changement tardif dans ce projet ?",
    options: [
      { value: 1, label: "Négligeable (itération rapide facile)" },
      { value: 3, label: "Significatif mais gérable" },
      { value: 5, label: "Catastrophique (construction, hardware, réglementaire)" },
    ],
    weight: { predictive: 1, agile: -1 },
  },
  {
    id: 'regulatory_environment',
    question: "Y a-t-il des contraintes réglementaires ou contractuelles fortes ?",
    options: [
      { value: 1, label: "Aucune" },
      { value: 3, label: "Quelques-unes" },
      { value: 5, label: "Très réglementé (pharma, défense, marchés publics)" },
    ],
    weight: { predictive: 1, agile: -1 },
  },
]

export type ProjectApproach = 'predictive' | 'agile' | 'hybrid'

export function computeApproach(answers: Record<string, number>): {
  approach: ProjectApproach
  score: { predictive: number; agile: number }
  confidence: 'high' | 'medium' | 'low'
  rationale: string
} {
  let predictiveScore = 0
  let agileScore = 0

  for (const question of TAILORING_QUESTIONS) {
    const answer = answers[question.id] ?? 3
    predictiveScore += answer * question.weight.predictive
    agileScore += answer * question.weight.agile
  }

  const diff = Math.abs(predictiveScore - agileScore)
  const confidence: 'high' | 'medium' | 'low' =
    diff > 8 ? 'high' : diff > 4 ? 'medium' : 'low'

  const approach: ProjectApproach =
    confidence === 'low' ? 'hybrid' :
    predictiveScore > agileScore ? 'predictive' : 'agile'

  const rationale = approach === 'hybrid'
    ? "Les signaux sont mixtes — une approche hybride est recommandée : jalons prédictifs pour la gouvernance, itérations agiles à l'intérieur."
    : approach === 'predictive'
    ? "Approche prédictive recommandée : exigences stables, coût de changement élevé, ou environnement réglementé."
    : "Approche agile recommandée : livrables divisibles, parties prenantes disponibles, exigences évolutives."

  return { approach, score: { predictive: predictiveScore, agile: agileScore }, confidence, rationale }
}
