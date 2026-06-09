import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getAllPosts, getPostBySlug } from '@/lib/blog'
import { Callout } from '@/components/blog/Callout'

export const revalidate = 3600

const mdxComponents = { Callout }

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map(p => ({ slug: p.slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return {}
  return {
    title: `${post.title} — Abema PM`,
    description: post.metaDescription || post.excerpt,
    openGraph: {
      title: post.title,
      description: post.metaDescription || post.excerpt,
      type: 'article',
      publishedTime: post.date,
      url: `https://pm.abemaagency.com/blog/${post.slug}`,
    },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  return (
    <div className="min-h-screen" style={{ background: '#0A0A0F', color: '#C4BAA6' }}>
      <div className="px-4 pt-8 pb-4 max-w-3xl mx-auto">
        <div className="flex items-center gap-2 text-xs" style={{ color: '#8A8070' }}>
          <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
          <span>/</span>
          <span style={{ color: '#C4BAA6' }}>{post.title}</span>
        </div>
      </div>

      <header className="px-4 pb-12 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-semibold px-2 py-1 rounded-full"
            style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B' }}>
            {post.category}
          </span>
          <span className="text-xs" style={{ color: '#8A8070' }}>
            {new Date(post.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
          <span className="text-xs" style={{ color: '#8A8070' }}>· {post.readTime}</span>
        </div>
        <h1 className="text-4xl font-black mb-4 leading-tight"
          style={{ fontFamily: "'Big Shoulders Display', 'Arial Narrow', Impact, sans-serif", color: '#F0EBE0', letterSpacing: '0.02em' }}>
          {post.title}
        </h1>
        <p className="text-lg leading-relaxed" style={{ color: '#8A8070' }}>{post.excerpt}</p>
      </header>

      <article className="px-4 pb-20 max-w-3xl mx-auto prose-custom">
        <style>{`
          .prose-custom h2 { font-family: 'Big Shoulders Display', sans-serif; font-size: 1.5rem; font-weight: 900; color: #F0EBE0; letter-spacing: 0.03em; margin: 2rem 0 1rem; }
          .prose-custom h3 { font-size: 1.1rem; font-weight: 700; color: #F0EBE0; margin: 1.5rem 0 0.75rem; }
          .prose-custom p { font-size: 1rem; line-height: 1.8; color: #C4BAA6; margin-bottom: 1.25rem; }
          .prose-custom ul, .prose-custom ol { color: #C4BAA6; padding-left: 1.5rem; margin-bottom: 1.25rem; }
          .prose-custom li { margin-bottom: 0.5rem; line-height: 1.7; }
          .prose-custom strong { color: #F0EBE0; font-weight: 700; }
          .prose-custom code { font-family: monospace; background: rgba(255,255,255,0.06); color: #F59E0B; padding: 2px 6px; border-radius: 4px; font-size: 0.875rem; }
          .prose-custom pre { background: #07070E; border: 1px solid rgba(255,255,255,0.07); border-radius: 8px; padding: 16px; overflow-x: auto; margin: 1.5rem 0; }
          .prose-custom pre code { background: none; color: #C4BAA6; padding: 0; }
          .prose-custom a { color: #F59E0B; text-decoration: underline; }
          .prose-custom hr { border-color: rgba(255,255,255,0.08); margin: 2rem 0; }
        `}</style>
        <MDXRemote source={post.content} components={mdxComponents} />
      </article>

      <div className="px-4 pb-20 max-w-3xl mx-auto border-t" style={{ borderColor: 'rgba(255,255,255,0.07)', paddingTop: '2rem' }}>
        <div className="flex items-center justify-between">
          <Link href="/blog" className="text-sm hover:text-white transition-colors" style={{ color: '#8A8070' }}>
            ← Tous les articles
          </Link>
          <Link href="/signup"
            className="inline-flex items-center gap-2 px-6 py-2 rounded-lg font-semibold text-sm"
            style={{ background: '#F59E0B', color: '#0A0A0F' }}>
            Essayer Abema PM gratuitement
          </Link>
        </div>
      </div>
    </div>
  )
}
