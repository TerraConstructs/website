import { LINKS } from '@/lib/links'
import { SITE_NAME, SITE_URL } from '@/lib/site'

/**
 * Emits JSON-LD. Rendered as a plain script tag rather than next/script so it is
 * present in the static HTML for crawlers that do not execute JavaScript.
 */
function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

const ORGANIZATION = {
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/icon.svg`,
  sameAs: [LINKS.githubOrg, LINKS.cdkDev],
}

/** Site-wide graph: belongs on the landing page only. */
export function SiteJsonLd() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@graph': [
          ORGANIZATION,
          {
            '@type': 'WebSite',
            '@id': `${SITE_URL}/#website`,
            url: SITE_URL,
            name: SITE_NAME,
            publisher: { '@id': `${SITE_URL}/#organization` },
          },
        ],
      }}
    />
  )
}

export function ArticleJsonLd({
  title,
  description,
  url,
  datePublished,
  authors,
  image,
}: {
  title: string
  description: string
  url: string
  datePublished: string
  authors: string[]
  image: string
}) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: title,
        description,
        url,
        datePublished,
        image: `${SITE_URL}${image}`,
        author: authors.map((name) => ({ '@type': 'Person', name })),
        publisher: { '@id': `${SITE_URL}/#organization` },
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      }}
    />
  )
}

/**
 * Workshop pages already carry real breadcrumbs, so the markup mirrors them.
 * Hrefs are normalised to a trailing slash to match `trailingSlash: true` and
 * the canonical tag — the previous site let these two forms diverge.
 */
export function BreadcrumbJsonLd({ items }: { items: { title: string; href: string }[] }) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: item.title,
          item: `${SITE_URL}${item.href.replace(/\/?$/, '/')}`,
        })),
      }}
    />
  )
}
