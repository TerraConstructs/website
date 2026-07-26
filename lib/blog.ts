import fs from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'
import GithubSlugger from 'github-slugger'

const BLOG_DIR = path.join(process.cwd(), 'content/blog')

export type Heading = { depth: 2 | 3; text: string; slug: string }

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

/** Strips fenced code blocks so headings inside them are never picked up. */
function withoutCodeFences(md: string) {
  return md.replace(/^```[\s\S]*?^```$/gm, '')
}

/**
 * Collects h2/h3 headings with the exact same slugs rehype-slug will generate,
 * so the floating ToC anchors always resolve.
 */
function extractHeadings(md: string): Heading[] {
  const slugger = new GithubSlugger()
  const headings: Heading[] = []

  for (const line of withoutCodeFences(md).split('\n')) {
    const match = /^(#{2,3})\s+(.+?)\s*#*$/.exec(line)
    if (!match) continue
    // strip inline markdown (code ticks, emphasis, links) from the label
    const text = match[2]
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, '$1')
      .trim()
    headings.push({
      depth: match[1].length === 2 ? 2 : 3,
      text,
      slug: slugger.slug(text),
    })
  }

  return headings
}

function readingMinutes(md: string) {
  const words = withoutCodeFences(md).split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
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
