import Link from 'next/link'
import { LINKS } from '@/lib/links'
import { Mark } from './logo'

const COLUMNS = [
  {
    title: 'Project',
    links: [
      { label: 'GitHub — base', href: LINKS.github, external: true },
      { label: 'Documentation', href: LINKS.docs, external: true },
      { label: 'AWS workshop', href: LINKS.workshop, external: true },
      { label: 'Blog', href: '/blog', external: false },
    ],
  },
  {
    title: 'Built on',
    links: [
      { label: 'CDK Terrain', href: LINKS.cdktn, external: true },
      { label: 'OpenTofu', href: LINKS.opentofu, external: true },
      { label: 'AWS CDK', href: LINKS.awsCdk, external: true },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: 'cdk.dev Slack', href: LINKS.cdkDev, external: true },
      { label: 'Open an issue', href: LINKS.issues, external: true },
      { label: 'Apache-2.0 license', href: LINKS.license, external: true },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-xs">
            <div className="flex items-center gap-2">
              <Mark className="size-5" />
              <span className="font-mono text-sm font-medium">terraconstructs</span>
            </div>
            <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground">
              Infrastructure as actual code. Typed constructs that synthesize to Terraform and
              OpenTofu — Apache-2.0, community built, no commercial edition.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h3 className="label-mono">{col.title}</h3>
                <ul className="mt-3 flex flex-col gap-2">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t pt-6 font-mono text-[0.6875rem] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>Apache-2.0 · Not affiliated with HashiCorp or Amazon Web Services.</p>
          <p>CDK Terrain and the Terraform CDK are MPL-2.0 licensed.</p>
        </div>
      </div>
    </footer>
  )
}
