export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const error = params.error

  return (
    <div style={{ maxWidth: 400, margin: '100px auto', padding: 24, fontFamily: 'sans-serif' }}>
      <h1 style={{ marginBottom: 24 }}>Connexion</h1>

      <form action="/api/auth/login" method="POST">
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: 4 }}>Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            style={{ width: '100%', padding: 8, fontSize: 16, boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: 4 }}>Mot de passe</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            style={{ width: '100%', padding: 8, fontSize: 16, boxSizing: 'border-box' }}
          />
        </div>

        {error && (
          <p style={{ color: 'red', marginBottom: 16 }}>{decodeURIComponent(error)}</p>
        )}

        <button
          type="submit"
          style={{ width: '100%', padding: 10, fontSize: 16, cursor: 'pointer' }}
        >
          Se connecter
        </button>
      </form>
    </div>
  )
}
