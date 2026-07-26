import { ArrowUpRight, GitPullRequest, MessagesSquare, GraduationCap } from 'lucide-react'
import { LINKS } from '@/lib/links'

const PATHS = [
  {
    icon: MessagesSquare,
    title: 'Get help on cdk.dev',
    body: 'The CDK community Slack is where questions get answered — including the TerraConstructs channels. There is no support contract to buy, because there is nothing to sell.',
    cta: 'Join cdk.dev',
    href: LINKS.cdkDev,
    primary: true,
  },
  {
    icon: GraduationCap,
    title: 'Work through the AWS workshop',
    body: 'A guided, hands-on build: Lambda, API Gateway, assets and IAM, deployed with Terraform or OpenTofu from a construct program.',
    cta: 'Open the workshop',
    href: LINKS.workshop,
  },
  {
    icon: GitPullRequest,
    title: 'Contribute a construct',
    body: 'The AWS surface is ported; GCP and Azure L2s are next. Good first issues, an open roadmap, and Apache-2.0 all the way down.',
    cta: 'terraconstructs/base',
    href: LINKS.github,
  },
]

export function CommunityCta() {
  return (
    <section id="community" className="relative scroll-mt-16 overflow-hidden">
      <div className="grid-backdrop pointer-events-none absolute inset-0 opacity-50" aria-hidden />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-brand/[0.06] to-transparent"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="max-w-2xl">
          <span className="label-mono">Open source, all the way down</span>
          <h2 className="mt-4 text-balance text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
            There is no paid tier. There is a community.
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            TerraConstructs is Apache-2.0 with no commercial offering and no enterprise edition. If
            it is useful to you, the way to repay it is to ask good questions in public and send
            patches.
          </p>
        </div>

        <div className="mt-12 grid gap-px overflow-hidden rounded-xl border bg-border md:grid-cols-3">
          {PATHS.map((path) => {
            const Icon = path.icon
            return (
              <a
                key={path.title}
                href={path.href}
                target="_blank"
                rel="noreferrer"
                className="group flex flex-col gap-4 bg-background p-6 transition-colors hover:bg-card/60 sm:p-8"
              >
                <span
                  className={
                    path.primary
                      ? 'flex size-9 items-center justify-center rounded-md bg-brand text-brand-foreground'
                      : 'flex size-9 items-center justify-center rounded-md border text-muted-foreground'
                  }
                >
                  <Icon className="size-4" />
                </span>
                <h3 className="text-base font-medium tracking-tight">{path.title}</h3>
                <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                  {path.body}
                </p>
                <span
                  className={
                    path.primary
                      ? 'mt-auto flex items-center gap-1 font-mono text-xs text-brand'
                      : 'mt-auto flex items-center gap-1 font-mono text-xs text-foreground'
                  }
                >
                  {path.cta}
                  <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
