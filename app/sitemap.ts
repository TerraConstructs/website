import type { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/blog'
import { getAllWorkshopParams } from '@/lib/workshops'
import { SITE_URL } from '@/lib/site'

/** Required under `output: 'export'` — emits a real sitemap.xml file. */
export const dynamic = 'force-static'

/**
 * `trailingSlash: true` is set, so every URL here ends in `/` to match the
 * emitted files and the canonical tags. The previous site's sitemap and
 * canonicals disagreed on this; they must not diverge again.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, workshopParams] = await Promise.all([getAllPosts(), getAllWorkshopParams()])

  const entries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/blog/`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/workshops/`, changeFrequency: 'monthly', priority: 0.8 },
  ]

  for (const post of posts) {
    entries.push({
      url: `${SITE_URL}/blog/${post.slug}/`,
      lastModified: post.date || undefined,
      changeFrequency: 'monthly',
      priority: 0.7,
    })
  }

  for (const { slug } of workshopParams) {
    entries.push({
      url: `${SITE_URL}/workshops/${slug.join('/')}/`,
      changeFrequency: 'monthly',
      priority: 0.6,
    })
  }

  return entries
}
