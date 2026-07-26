import fs from 'node:fs/promises'
import path from 'node:path'
import { cache } from 'react'
import matter from 'gray-matter'
import { extractHeadings, type Heading } from './markdown'
import { LINKS } from './links'

/**
 * Workshop content is a directory tree of MDX under content/workshops/<locale>/<cloud>.
 *
 *   content/workshops/en/aws/20-typescript/30-hello-cdk/200-lambda.mdx
 *                     |  |   |             |            `- page
 *                     |  |   `- chapter    `- section
 *                     |  `- cloud
 *                     `- locale
 *
 * Numeric prefixes exist only to order the tree; every URL segment drops them.
 * `index.mdx` is the section's own landing page. There is no `weight` in
 * frontmatter — ordering lives in the filename, which keeps the two from
 * disagreeing (as they did in the Hugo source).
 */

const CONTENT_DIR = path.join(process.cwd(), 'content/workshops')
const DEFAULT_LOCALE = 'en'

/** Where "Edit this page" points. Swap when the site repo moves. */
const EDIT_BASE = `${LINKS.websiteRepo}/edit/main`

export type WorkshopId = 'aws' | 'azure' | 'gcp'

export type WorkshopSummary = {
  id: WorkshopId
  name: string
  description: string
  available: boolean
}

/** The /workshops index. Only AWS has content; the others are announced, not linked. */
export const WORKSHOPS: WorkshopSummary[] = [
  {
    id: 'aws',
    name: 'AWS',
    description:
      'Build and deploy a serverless application on AWS with TerraConstructs and CDKTN — Lambda, API Gateway and DynamoDB, plus your own reusable constructs.',
    available: true,
  },
  {
    id: 'azure',
    name: 'Azure',
    description: 'The same construct-driven workflow, targeting Azure.',
    available: false,
  },
  {
    id: 'gcp',
    name: 'Google Cloud',
    description: 'The same construct-driven workflow, targeting Google Cloud.',
    available: false,
  },
]

export type WorkshopNode = {
  title: string
  /** URL path segments below /workshops, e.g. ['aws', 'typescript', 'hello-cdk'] */
  segments: string[]
  href: string
  /** True when this node has its own child pages. */
  isSection: boolean
  children: WorkshopNode[]
}

export type WorkshopPage = {
  title: string
  description: string
  segments: string[]
  href: string
  content: string
  headings: Heading[]
  editUrl: string
  breadcrumbs: { title: string; href: string }[]
  prev: { title: string; href: string } | null
  next: { title: string; href: string } | null
}

const stripOrder = (name: string) => name.replace(/^\d+-/, '')
const orderOf = (name: string) => Number(/^(\d+)-/.exec(name)?.[1] ?? 9999)
const hrefFor = (segments: string[]) => `/workshops/${segments.join('/')}`

async function readTitle(file: string): Promise<{ title: string; description: string }> {
  const raw = await fs.readFile(file, 'utf8')
  const { data } = matter(raw)
  return {
    title: String(data.title ?? path.basename(file, '.mdx')),
    description: String(data.description ?? ''),
  }
}

/** Recursively builds the nav tree for one workshop. */
async function buildTree(dir: string, segments: string[]): Promise<WorkshopNode[]> {
  let entries
  try {
    entries = await fs.readdir(dir, { withFileTypes: true })
  } catch {
    return []
  }

  const ordered = entries
    .filter((e) => e.isDirectory() || (e.name.endsWith('.mdx') && e.name !== 'index.mdx'))
    .sort((a, b) => orderOf(a.name) - orderOf(b.name) || a.name.localeCompare(b.name))

  const nodes: WorkshopNode[] = []
  for (const entry of ordered) {
    const seg = stripOrder(entry.name.replace(/\.mdx$/, ''))
    const childSegments = [...segments, seg]

    if (entry.isDirectory()) {
      const indexFile = path.join(dir, entry.name, 'index.mdx')
      const meta = await readTitle(indexFile).catch(() => ({ title: seg, description: '' }))
      const children = await buildTree(path.join(dir, entry.name), childSegments)
      nodes.push({
        title: meta.title,
        segments: childSegments,
        href: hrefFor(childSegments),
        isSection: true,
        children,
      })
    } else {
      const meta = await readTitle(path.join(dir, entry.name))
      nodes.push({
        title: meta.title,
        segments: childSegments,
        href: hrefFor(childSegments),
        isSection: false,
        children: [],
      })
    }
  }
  return nodes
}

export const getWorkshopTree = cache(
  async (workshop: WorkshopId = 'aws', locale = DEFAULT_LOCALE): Promise<WorkshopNode | null> => {
    const root = path.join(CONTENT_DIR, locale, workshop)
    const indexFile = path.join(root, 'index.mdx')
    const meta = await readTitle(indexFile).catch(() => null)
    if (!meta) return null

    return {
      title: meta.title,
      segments: [workshop],
      href: hrefFor([workshop]),
      isSection: true,
      children: await buildTree(root, [workshop]),
    }
  },
)

/** Depth-first flattening — the reading order, and therefore the prev/next order. */
function flatten(node: WorkshopNode): WorkshopNode[] {
  return [node, ...node.children.flatMap(flatten)]
}

export const getWorkshopPages = cache(
  async (workshop: WorkshopId = 'aws', locale = DEFAULT_LOCALE): Promise<WorkshopNode[]> => {
    const tree = await getWorkshopTree(workshop, locale)
    return tree ? flatten(tree) : []
  },
)

/**
 * Resolves URL segments back to a source file. Each segment lost its numeric
 * prefix in the URL, so matching walks the real directory once per level
 * rather than guessing the prefix.
 */
async function resolveFile(segments: string[], locale: string): Promise<string | null> {
  let dir = path.join(CONTENT_DIR, locale)

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]
    let entries
    try {
      entries = await fs.readdir(dir, { withFileTypes: true })
    } catch {
      return null
    }

    const asDir = entries.find((e) => e.isDirectory() && stripOrder(e.name) === seg)
    const asFile = entries.find(
      (e) => e.isFile() && e.name.endsWith('.mdx') && stripOrder(e.name.replace(/\.mdx$/, '')) === seg,
    )

    // A leaf page wins only on the last segment; otherwise keep descending.
    if (i === segments.length - 1) {
      if (asFile) return path.join(dir, asFile.name)
      if (asDir) return path.join(dir, asDir.name, 'index.mdx')
      return null
    }
    if (!asDir) return null
    dir = path.join(dir, asDir.name)
  }

  return path.join(dir, 'index.mdx')
}

export const getWorkshopPage = cache(
  async (segments: string[], locale = DEFAULT_LOCALE): Promise<WorkshopPage | null> => {
    const file = await resolveFile(segments, locale)
    if (!file) return null

    let raw: string
    try {
      raw = await fs.readFile(file, 'utf8')
    } catch {
      return null
    }

    const { data, content } = matter(raw)
    const workshop = segments[0] as WorkshopId
    const pages = await getWorkshopPages(workshop, locale)
    const href = hrefFor(segments)

    const index = pages.findIndex((p) => p.href === href)
    const prev = index > 0 ? pages[index - 1] : null
    const next = index !== -1 && index < pages.length - 1 ? pages[index + 1] : null

    // Ancestors, resolved against the flattened tree so titles match the sidebar.
    const breadcrumbs = segments.slice(0, -1).map((_, i) => {
      const ancestorHref = hrefFor(segments.slice(0, i + 1))
      const node = pages.find((p) => p.href === ancestorHref)
      return { title: node?.title ?? segments[i], href: ancestorHref }
    })

    return {
      title: String(data.title ?? segments.at(-1) ?? 'Workshop'),
      description: String(data.description ?? ''),
      segments,
      href,
      content,
      headings: extractHeadings(content),
      editUrl: `${EDIT_BASE}/${path.relative(process.cwd(), file)}`,
      breadcrumbs,
      prev: prev ? { title: prev.title, href: prev.href } : null,
      next: next ? { title: next.title, href: next.href } : null,
    }
  },
)

/** Every route under /workshops/[...slug], for generateStaticParams. */
export async function getAllWorkshopParams(locale = DEFAULT_LOCALE) {
  const available = WORKSHOPS.filter((w) => w.available)
  const all = await Promise.all(available.map((w) => getWorkshopPages(w.id, locale)))
  return all.flat().map((node) => ({ slug: node.segments }))
}

/** Child links for `<ChildrenList />`, which the Hugo `children` shortcode became. */
export const getWorkshopChildren = cache(
  async (segments: string[], locale = DEFAULT_LOCALE) => {
    const tree = await getWorkshopTree(segments[0] as WorkshopId, locale)
    if (!tree) return []
    const href = hrefFor(segments)
    const node = flatten(tree).find((n) => n.href === href)
    return node?.children.map((c) => ({ title: c.title, href: c.href })) ?? []
  },
)
