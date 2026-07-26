import { ArrowUpRight, ShieldCheck, Workflow } from 'lucide-react'
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
    name: 'terraform-provider-aws',
    license: 'MPL-2.0',
    role: 'Plain provider resources. Not a wrapper, not a shim — the same resource types your modules already declare.',
    href: 'https://registry.terraform.io/providers/hashicorp/aws/latest',
  },
  {
    name: 'Terraform / OpenTofu',
    license: 'BUSL / MPL-2.0',
    role: 'The engine, the providers and the state you already operate.',
    href: LINKS.opentofu,
  },
]

const SCANNERS = ['tflint', 'Checkov', 'OPA / Conftest', 'Terrascan', 'Trivy', 'Sentinel']

const RUNNERS = [
  'Atlantis',
  'Terraform Cloud',
  'env0',
  'Scalr',
  'Spacelift',
  'Terrateam',
  'Digger',
]

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <li className="rounded-md border bg-background px-2.5 py-1 font-mono text-[0.6875rem] text-muted-foreground">
      {children}
    </li>
  )
}

export function Foundation() {
  return (
    <section className="border-b">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-16">
          <div>
            <span className="label-mono">The stack underneath</span>
            <h2 className="mt-4 text-balance text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
              No new engine. No new state format. No new vendor.
            </h2>
            <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
              The output is plain{' '}
              <code className="font-mono text-[0.8125rem] text-foreground">
                terraform-provider-aws
              </code>{' '}
              — the same resource types your modules already declare. Nobody has to sign a new
              contract, stand up a new control plane, or learn to lint and operate CloudFormation.
            </p>
            <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
              Your platform team keeps the engine, the state, the providers and the entire toolchain
              they have been running for years. TerraConstructs sits above all of it and hands them
              HCL.
            </p>
          </div>

          <ol className="flex flex-col gap-px overflow-hidden rounded-xl border bg-border">
            {STACK.map((layer, i) => (
              <li key={layer.name} className="bg-background">
                <a
                  href={layer.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-start gap-4 p-5 transition-colors hover:bg-card/60 sm:px-6"
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

        <div className="mt-12 grid gap-px overflow-hidden rounded-xl border bg-border md:grid-cols-2">
          <div className="flex flex-col gap-6 bg-background p-6 sm:p-7">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="size-4 shrink-0 text-doc" aria-hidden />
              <h3 className="text-sm font-medium">Your existing gates just work</h3>
            </div>

            <div>
              <span className="label-mono">Linters and SAST</span>
              <ul className="mt-2.5 flex flex-wrap gap-1.5">
                {SCANNERS.map((s) => (
                  <Chip key={s}>{s}</Chip>
                ))}
              </ul>
              <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground">
                They read HCL and provider resources, which is exactly what synthesis emits. Every
                OPA bundle your security team has accumulated keeps evaluating the same resource
                addresses.
              </p>
            </div>

            <div>
              <span className="label-mono">Automation and collaboration</span>
              <ul className="mt-2.5 flex flex-wrap gap-1.5">
                {RUNNERS.map((r) => (
                  <Chip key={r}>{r}</Chip>
                ))}
              </ul>
              <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground">
                None of them need to know TerraConstructs exists. They see plain Terraform — or
                OpenTofu — and plan and apply it the way they always have.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 bg-background p-6 sm:p-7">
            <div className="flex items-center gap-2.5">
              <Workflow className="size-4 shrink-0 text-brand" aria-hidden />
              <h3 className="text-sm font-medium">And one thing you could not do before</h3>
            </div>
            <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
              Policy-as-code runs <em className="italic">after</em>
              {' the document exists: you emit HCL, then a scanner tells you it was wrong. Because '}
              {'there is now an object graph, platform teams get a hook that runs '}
              <em className="italic">before</em>
              {' synthesis.'}
            </p>
            <div className="overflow-hidden rounded-lg border bg-surface">
              <pre className="overflow-x-auto p-4 font-mono text-[0.75rem] leading-[1.7]">
                <code>
                  <span className="text-muted-foreground/60">
                    {'// visit every node, before any HCL is written\n'}
                  </span>
                  <span className="text-foreground/90">{'Aspects.of(app).add('}</span>
                  {'\n'}
                  <span className="text-foreground/90">{'  new EncryptionAtRest(),'}</span>
                  {'\n'}
                  <span className="text-foreground/90">{'  new RequireTagsAspect(taxonomy),'}</span>
                  {'\n'}
                  <span className="text-foreground/90">{')'}</span>
                </code>
              </pre>
            </div>
            <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
              An Aspect visits every construct and can <em className="italic">mutate</em>
              {' it — turning on encryption, attaching a tag taxonomy, forcing a log retention '}
              {'floor. You stop failing builds for drift from a standard and start applying the '}
              {'standard.'}
            </p>
            <p className="mt-auto text-pretty text-xs leading-relaxed text-muted-foreground">
              Hardening becomes a library your teams inherit, not a wiki page they are audited
              against. And your scanners still run afterwards, unchanged, as the backstop.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
