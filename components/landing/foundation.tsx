import { ArrowUpRight } from 'lucide-react'
import { LINKS } from '@/lib/links'

const STACK = [
  {
    name: 'TerraConstructs',
    license: 'Apache-2.0',
    role: 'L2 construct library — asset pipeline, IAM SDK, ASL, service constructs.',
    href: LINKS.github,
    accent: true,
  },
  {
    name: 'CDK Terrain (cdktn)',
    license: 'MPL-2.0',
    role: 'The community fork of the Terraform CDK. Synthesizes constructs and targets both OpenTofu and Terraform.',
    href: LINKS.cdktn,
  },
  {
    name: 'Terraform / OpenTofu',
    license: 'BUSL / MPL-2.0',
    role: 'The engine, the providers and the state you already operate.',
    href: LINKS.opentofu,
  },
]

export function Foundation() {
  return (
    <section className="border-b">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-16">
          <div>
            <span className="label-mono">The stack underneath</span>
            <h2 className="mt-4 text-balance text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
              No new engine. No new state format.
            </h2>
            <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
              TerraConstructs synthesizes through CDK Terrain, the community fork of the Terraform
              CDK, which supports both OpenTofu and Terraform. Everything below the construct layer
              is what your organisation already reviews, plans and applies.
            </p>
          </div>

          <ol className="flex flex-col gap-px overflow-hidden rounded-xl border bg-border">
            {STACK.map((layer, i) => (
              <li key={layer.name} className="bg-background">
                <a
                  href={layer.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-start gap-4 p-5 transition-colors hover:bg-card/60 sm:p-6"
                >
                  <span className="mt-0.5 font-mono text-[0.6875rem] tabular-nums text-muted-foreground/60">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        className={
                          layer.accent
                            ? 'font-mono text-sm font-medium text-brand'
                            : 'font-mono text-sm font-medium'
                        }
                      >
                        {layer.name}
                      </h3>
                      <span className="rounded border px-1.5 py-0.5 font-mono text-[0.625rem] text-muted-foreground">
                        {layer.license}
                      </span>
                      <ArrowUpRight className="size-3.5 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                    <p className="mt-1.5 text-pretty text-sm leading-relaxed text-muted-foreground">
                      {layer.role}
                    </p>
                  </div>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
