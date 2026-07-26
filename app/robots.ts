import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

/** Required under `output: 'export'` — emits a real robots.txt file. */
export const dynamic = 'force-static'

/**
 * Carries over the previous site's public/robots.txt, including the SEO-crawler
 * blocks — those bots are pure cost, they send no traffic.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      { userAgent: ['SemrushBot', 'AhrefsBot', 'MJ12bot'], disallow: '/' },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: 'terraconstructs.dev',
  }
}
