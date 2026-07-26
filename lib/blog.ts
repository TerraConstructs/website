import fs from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'
import { extractHeadings, readingMinutes, type Heading } from './markdown'

const BLOG_DIR = path.join(process.cwd(), 'content/blog')

export type { Heading }

export type PostMeta = {
  slug: string
  title: string
  description: string
  date: string
  authors: string[]
  tags: string[]
  readingMinutes: number
}

export type Post = PostMeta & {
  content: string
  headings: Heading[]
}

function toArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String)
  if (typeof value === 'string' && value.trim()) return [value]
  return []
}

export async function getPostSlugs(): Promise<string[]> {
  const entries = await fs.readdir(BLOG_DIR, { withFileTypes: true })
  return entries
    .filter((e) => e.isFile() && e.name.endsWith('.mdx'))
    .map((e) => e.name.replace(/\.mdx$/, ''))
}

export async function getPost(slug: string): Promise<Post | null> {
  let raw: string
  try {
    raw = await fs.readFile(path.join(BLOG_DIR, `${slug}.mdx`), 'utf8')
  } catch {
    return null
  }

  const { data, content } = matter(raw)

  return {
    slug,
    title: String(data.title ?? slug),
    description: String(data.description ?? ''),
    date: String(data.date ?? ''),
    authors: toArray(data.authors),
    tags: toArray(data.tags),
    readingMinutes: readingMinutes(content),
    content,
    headings: extractHeadings(content),
  }
}

export async function getAllPosts(): Promise<PostMeta[]> {
  const slugs = await getPostSlugs()
  const posts = await Promise.all(slugs.map((s) => getPost(s)))

  return posts
    .filter((p): p is Post => p !== null)
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(({ content: _content, headings: _headings, ...meta }) => meta)
}

export function formatDate(iso: string) {
  const d = new Date(`${iso}T00:00:00Z`)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}
