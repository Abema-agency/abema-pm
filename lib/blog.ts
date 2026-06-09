import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'

const BLOG_DIR = path.join(process.cwd(), 'content/blog')

export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  date: string
  category: string
  tags: string[]
  readTime: string
  seoKeyword: string
  metaDescription: string
  content: string
}

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return []

  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.mdx'))

  const posts = files.map(filename => {
    const slug = filename.replace(/\.mdx$/, '')
    const raw = fs.readFileSync(path.join(BLOG_DIR, filename), 'utf8')
    const { data, content } = matter(raw)
    const rt = readingTime(content)

    return {
      slug,
      title: data.title ?? '',
      excerpt: data.excerpt ?? '',
      date: data.date ?? '',
      category: data.category ?? '',
      tags: data.tags ?? [],
      readTime: data.readTime ?? `${Math.ceil(rt.minutes)} min`,
      seoKeyword: data.seoKeyword ?? '',
      metaDescription: data.metaDescription ?? data.excerpt ?? '',
      content,
    } as BlogPost
  })

  return posts.sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}

export function getPostBySlug(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null

  const raw = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(raw)
  const rt = readingTime(content)

  return {
    slug,
    title: data.title ?? '',
    excerpt: data.excerpt ?? '',
    date: data.date ?? '',
    category: data.category ?? '',
    tags: data.tags ?? [],
    readTime: data.readTime ?? `${Math.ceil(rt.minutes)} min`,
    seoKeyword: data.seoKeyword ?? '',
    metaDescription: data.metaDescription ?? data.excerpt ?? '',
    content,
  }
}

export function getLatestPosts(n = 3): BlogPost[] {
  return getAllPosts().slice(0, n)
}
