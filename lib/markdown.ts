import GithubSlugger from 'github-slugger'

export type Heading = { depth: 2 | 3; text: string; slug: string }

/** Strips fenced code blocks so headings inside them are never picked up. */
export function withoutCodeFences(md: string) {
  return md.replace(/^```[\s\S]*?^```$/gm, '')
}

/**
 * Collects h2/h3 headings with the exact same slugs rehype-slug will generate,
 * so the floating ToC anchors always resolve.
 */
export function extractHeadings(md: string): Heading[] {
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

export function readingMinutes(md: string) {
  const words = withoutCodeFences(md).split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}
