import { Metadata } from 'next'
import Link from 'next/link'
import { getAllPosts } from '@/lib/blog'
import { MarketingHeader } from '@/components/layout/MarketingHeader'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Blog PMBOK 8 — Abema PM',
  description: 'Articles pratiques sur la gestion de projet PMBOK 8, EVM, risques et parties prenantes pour TPE/PME françaises.',
}

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <div className="min-h-screen" style={{ background: '#0A0A0F', color: '#C4BAA6' }}>
      <MarketingHeader />
      <div className="max-w-4xl mx-auto px-4 pt-6 pb-0">
        <a href="/" className="inline-flex items-center gap-2 text-sm transition-colors hover:text-white"
          style={{ color: '#8A8070' }}>
          ← Retour à l&apos;accueil
        </a>
      </div>
      <section className="py-20 px-4" style={{ background: '#0D0D16', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-6 border"
            style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B', borderColor: 'rgba(245,158,11,0.25)' }}>
            Ressources PMBOK 8
          </div>
          <h1 className="text-4xl font-black mb-4"
            style={{ fontFamily: "'Big Shoulders Display', 'Arial Narrow', Impact, sans-serif", color: '#F0EBE0', letterSpacing: '0.02em' }}>
            Blog Gestion de Projet
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: '#8A8070' }}>
            Guides pratiques PMBOK 8, EVM, gestion des risques — rédigés pour les équipes terrain, pas pour les cabinets conseil.
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          {posts.length === 0 ? (
            <div className="text-center py-20" style={{ color: '#8A8070' }}>
              <p className="text-lg">Premier article en préparation...</p>
              <p className="text-sm mt-2">Publication automatique chaque lundi.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {posts.map(post => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="block group">
                  <article className="p-6 rounded-xl transition-all"
                    style={{
                      background: '#0D0D16',
                      border: '1px solid rgba(255,255,255,0.07)',
                    }}>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-semibold px-2 py-1 rounded-full"
                        style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B' }}>
                        {post.category}
                      </span>
                      <span className="text-xs" style={{ color: '#8A8070' }}>
                        {new Date(post.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                      <span className="text-xs" style={{ color: '#8A8070' }}>· {post.readTime}</span>
                    </div>
                    <h2 className="text-xl font-black mb-2 group-hover:text-amber-400 transition-colors"
                      style={{ fontFamily: "'Big Shoulders Display', 'Arial Narrow', sans-serif", color: '#F0EBE0', letterSpacing: '0.02em' }}>
                      {post.title}
                    </h2>
                    <p className="text-sm leading-relaxed" style={{ color: '#8A8070' }}>
                      {post.excerpt}
                    </p>
                    <div className="mt-4 text-xs font-semibold" style={{ color: '#F59E0B' }}>
                      Lire l&apos;article →
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
