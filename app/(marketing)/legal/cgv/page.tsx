export default function CGVPage() {
  return (
    <div className="py-16 px-4">
      <div className="max-w-3xl mx-auto prose prose-slate">
        <h1>Conditions générales de vente</h1>
        <p className="text-slate-500 text-sm">Dernière mise à jour : mai 2026</p>

        <h2>1. Objet</h2>
        <p>
          Les présentes CGV régissent les conditions de vente des abonnements au service SaaS
          <strong> Abema PM</strong> proposé par Abema Agency.
        </p>

        <h2>2. Plans et tarifs</h2>
        <table>
          <thead>
            <tr>
              <th>Plan</th>
              <th>Prix HT/mois</th>
              <th>Engagement</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Lite</td><td>Gratuit</td><td>Sans engagement</td></tr>
            <tr><td>Solo</td><td>29 €</td><td>Mensuel ou annuel</td></tr>
            <tr><td>Pro</td><td>79 €</td><td>Mensuel ou annuel</td></tr>
            <tr><td>Team</td><td>149 €</td><td>Mensuel ou annuel</td></tr>
          </tbody>
        </table>
        <p>Tous les prix sont hors taxes. TVA applicable selon la législation en vigueur.</p>

        <h2>3. Inscription et accès</h2>
        <p>
          L'accès au service requiert la création d'un compte avec une adresse email valide.
          Vous êtes responsable de la confidentialité de vos identifiants de connexion.
        </p>

        <h2>4. Paiement</h2>
        <p>
          Les abonnements payants sont facturés mensuellement ou annuellement par carte bancaire
          via notre prestataire de paiement sécurisé. En cas d'impayé, l'accès au service
          peut être suspendu après mise en demeure.
        </p>

        <h2>5. Résiliation</h2>
        <p>
          Vous pouvez résilier votre abonnement à tout moment depuis votre espace client.
          La résiliation prend effet à la fin de la période en cours. Aucun remboursement
          prorata temporis n'est effectué, sauf en cas de faute imputable à Abema Agency.
        </p>

        <h2>6. Droit de rétractation</h2>
        <p>
          Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation
          de 14 jours ne s'applique pas aux services numériques dont l'exécution a commencé
          avec votre accord explicite avant la fin du délai de rétractation.
        </p>

        <h2>7. Disponibilité du service</h2>
        <p>
          Abema Agency s'engage à maintenir une disponibilité de <strong>99,5%</strong> par mois
          (hors maintenances planifiées). Les maintenances sont annoncées avec un préavis de 24h.
        </p>

        <h2>8. Limitation de responsabilité</h2>
        <p>
          La responsabilité d'Abema Agency est limitée au montant des sommes effectivement payées
          par le client au cours des 12 derniers mois. Abema Agency ne saurait être tenu responsable
          des pertes de données dues à un cas de force majeure.
        </p>

        <h2>9. Droit applicable</h2>
        <p>
          Les présentes CGV sont soumises au droit français. Tout litige sera soumis
          à la juridiction compétente du ressort du siège social d'Abema Agency.
        </p>

        <h2>10. Contact</h2>
        <p>
          Pour toute question relative aux CGV : <a href="mailto:agencyabema@gmail.com">agencyabema@gmail.com</a>
        </p>
      </div>
    </div>
  )
}
