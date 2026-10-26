import { SITE_URL } from '@/lib/site'

/** Required under `output: 'export'` — emits a real robots.txt file. */
export const dynamic = 'force-static'

/**
 * A route handler rather than the `robots.ts` metadata route, because
 * `MetadataRoute.Robots` has no slot for `Content-Signal`
 * (https://contentsignals.org), which has to sit inside a User-agent group.
 *
 * The signals say yes to all three uses: this is an open-source project's
 * documentation, and being in models and agent answers is how people find it.
 *
 * Carries over the previous site's SEO-crawler blocks — those bots are pure
 * cost, they send no traffic.
 */
export function GET() {
  const body = `User-Agent: *
Content-Signal: ai-train=yes, search=yes, ai-input=yes
Allow: /

User-Agent: SemrushBot
User-Agent: AhrefsBot
User-Agent: MJ12bot
Disallow: /

Host: terraconstructs.dev
Sitemap: ${SITE_URL}/sitemap.xml
`
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
