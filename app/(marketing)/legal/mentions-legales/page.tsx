export default function MentionsLegalesPage() {
  return (
    <div className="py-16 px-4">
      <div className="max-w-3xl mx-auto prose prose-slate">
        <h1>Mentions légales</h1>
        <p className="text-slate-500 text-sm">Dernière mise à jour : mai 2026</p>

        <h2>Éditeur du site</h2>
        <p>
          <strong>Abema Agency</strong><br />
          {/* TODO: Compléter SIRET et forme juridique */}
          Forme juridique : [À COMPLÉTER — ex: Auto-entrepreneur / SASU / EURL]<br />
          SIRET : [À COMPLÉTER]<br />
          Adresse : Hauts-de-France, France<br />
          Email : <a href="mailto:agencyabema@gmail.com">agencyabema@gmail.com</a>
        </p>

        <h2>Hébergement</h2>
        <p>
          Ce site est hébergé par <strong>Vercel Inc.</strong> (340 Pine Street, San Francisco, CA 94104, USA)
          et les données sont stockées via <strong>Supabase</strong> sur des serveurs situés dans
          la région <strong>EU (Frankfurt, Allemagne)</strong>.
        </p>

        <h2>Propriété intellectuelle</h2>
        <p>
          L'ensemble des contenus présents sur ce site (textes, graphiques, logo, icônes, images)
          est la propriété exclusive d'Abema Agency. Toute reproduction, représentation, modification
          ou adaptation, totale ou partielle, est interdite sans autorisation écrite préalable.
        </p>

        <h2>Responsabilité</h2>
        <p>
          Abema Agency s'efforce de fournir des informations exactes et à jour. Toutefois, nous ne
          pouvons garantir l'exactitude, la complétude ou l'actualité des informations diffusées.
          L'utilisateur est seul responsable de l'utilisation qu'il fait des informations fournies.
        </p>

        <h2>Contact</h2>
        <p>
          Pour toute question relative aux mentions légales : <a href="mailto:agencyabema@gmail.com">agencyabema@gmail.com</a>
        </p>
      </div>
    </div>
  )
}
