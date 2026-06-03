export default function CGVPage() {
  return (
    <div className="py-16 px-4">
      <div className="max-w-3xl mx-auto prose prose-slate">
        <h1>Conditions Générales de Vente</h1>
        <p className="text-slate-500 text-sm">Version 1.1 — Entrée en vigueur : juin 2026.</p>

        <h2>1. Préambule et acceptation</h2>
        <p>
          Les présentes CGV encadrent la fourniture du service SaaS Abema PM par ABEMA AGENCY
          (SIREN 925 242 976) à ses utilisateurs. L&apos;inscription et l&apos;utilisation du service
          valent acceptation pleine et entière des présentes CGV.
        </p>

        <h2>2. Identité du vendeur</h2>
        <ul>
          <li><strong>ABEMA AGENCY</strong> — Micro-entreprise</li>
          <li>SIREN : 925 242 976</li>
          <li>Représentant légal : Abdallah Ait Essaghir</li>
          <li>25 Rue de Rouvroy, 62680 Méricourt, France</li>
          <li>Email : <a href="mailto:contact@abemaagency.com">contact@abemaagency.com</a></li>
        </ul>

        <h2>3. Description du service</h2>
        <p>
          Abema PM est un outil SaaS de gestion de projet bâti sur le référentiel PMBOK 8,
          intégrant un copilote IA (Claude d&apos;Anthropic), un tailoring engine, un registre des
          risques P×I, un registre des parties prenantes et des fonctionnalités de génération
          d&apos;artefacts projet.
        </p>

        <h2>4. Plans et tarifs</h2>
        <table>
          <thead>
            <tr>
              <th>Plan</th>
              <th>Prix HT/mois</th>
              <th>Projets</th>
              <th>Copilote IA</th>
              <th>Engagement</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Lite</td>
              <td>Gratuit</td>
              <td>3 actifs</td>
              <td>10 req/jour</td>
              <td>Sans engagement</td>
            </tr>
            <tr>
              <td>Solo</td>
              <td>29 €</td>
              <td>10 actifs</td>
              <td>50 req/jour</td>
              <td>Mensuel</td>
            </tr>
            <tr>
              <td>Pro</td>
              <td>79 €</td>
              <td>Illimités</td>
              <td>200 req/jour</td>
              <td>Mensuel</td>
            </tr>
            <tr>
              <td>Team</td>
              <td>149 €</td>
              <td>Illimités</td>
              <td>200 req/jour + équipe</td>
              <td>Mensuel</td>
            </tr>
          </tbody>
        </table>
        <p>
          Tous les prix sont hors taxes. TVA applicable selon la législation en vigueur.
          ABEMA AGENCY peut être en franchise de TVA (art. 293 B du CGI) ; le cas échéant,
          la mention « TVA non applicable, art. 293 B du CGI » figure sur la facture.
        </p>

        <h2>5. Commande et accès</h2>
        <p>
          L&apos;accès au service requiert la création d&apos;un compte avec une adresse email valide.
          Pour les plans payants, l&apos;abonnement est activé après validation du paiement.
          L&apos;utilisateur est responsable de la confidentialité de ses identifiants de connexion.
        </p>

        <h2>6. Paiement</h2>
        <p>
          Les abonnements payants sont facturés mensuellement par carte bancaire via notre
          prestataire de paiement sécurisé. En cas d&apos;impayé, l&apos;accès au service peut être
          suspendu après mise en demeure. Conformément à l&apos;art. L.441-10 du Code de commerce,
          des pénalités de retard sont applicables sans qu&apos;un rappel soit nécessaire.
        </p>

        <h2>7. Durée et résiliation</h2>
        <p>
          Les abonnements sont conclus sans engagement de durée minimum. Résiliation possible
          à tout moment depuis l&apos;espace client ou par email à{' '}
          <a href="mailto:contact@abemaagency.com">contact@abemaagency.com</a>.
          La résiliation prend effet à la fin de la période en cours. Aucun remboursement
          prorata temporis n&apos;est effectué, sauf faute imputable à ABEMA AGENCY.
        </p>

        <h2>8. Droit de rétractation</h2>
        <p>
          Conformément à l&apos;article L221-28 du Code de la consommation, le droit de rétractation
          de 14 jours ne s&apos;applique pas aux services numériques dont l&apos;exécution a commencé avec
          l&apos;accord explicite de l&apos;utilisateur avant la fin du délai de rétractation (accès
          immédiat au service après inscription).
        </p>

        <h2>9. Disponibilité du service</h2>
        <p>
          ABEMA AGENCY s&apos;engage à maintenir une disponibilité de <strong>99,5 %</strong> par mois hors
          maintenances planifiées. Les maintenances sont annoncées avec un préavis de 24h
          dans la mesure du possible.
        </p>

        <h2>10. Responsabilité</h2>
        <p>
          La responsabilité d&apos;ABEMA AGENCY est limitée au montant des sommes effectivement
          payées par le client au cours des 12 derniers mois. ABEMA AGENCY ne saurait être
          tenue responsable des pertes de données dues à un cas de force majeure ou à une
          faute de l&apos;utilisateur.
        </p>
        <p>
          Les résultats produits par le copilote IA sont générés automatiquement et fournis
          à titre indicatif. L&apos;utilisateur reste seul responsable des décisions prises sur
          la base de ces suggestions.
        </p>

        <h2>11. Propriété intellectuelle</h2>
        <p>
          Le service Abema PM, son code source, son design et ses contenus sont la propriété
          exclusive d&apos;ABEMA AGENCY. Les données de projet saisies par l&apos;utilisateur restent
          sa propriété. L&apos;utilisateur concède à ABEMA AGENCY une licence non exclusive
          d&apos;utilisation de ces données aux seules fins de fourniture du service.
        </p>

        <h2>12. Données personnelles</h2>
        <p>
          Le traitement des données personnelles est encadré par la{' '}
          <a href="/legal/politique-de-confidentialite">Politique de confidentialité</a>.
        </p>

        <h2>13. Droit applicable et litiges</h2>
        <p>
          Les présentes CGV sont soumises au droit français. Tout litige sera soumis à une
          tentative de résolution amiable préalable (30 jours), puis aux juridictions compétentes
          du ressort du siège social d&apos;ABEMA AGENCY (Tribunal judiciaire d&apos;Arras).
        </p>

        <h2>14. Contact</h2>
        <p>
          <a href="mailto:contact@abemaagency.com">contact@abemaagency.com</a>
          {' '}—{' '}
          <a href="tel:+33650983972">+33 6 50 98 39 72</a>
        </p>
      </div>
    </div>
  )
}
