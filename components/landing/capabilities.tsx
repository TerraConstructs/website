import { Boxes, KeyRound, Workflow, Layers } from 'lucide-react'
import { LINKS } from '@/lib/links'

const CAPABILITIES = [
  {
    icon: Boxes,
    kicker: 'Ported in full',
    title: 'The AWS CDK asset pipeline',
    body: 'Code.fromAsset() and DockerImageAsset work the way you remember them — except the bundling, hashing, upload and lifecycle are handled by Terraform providers and Terraform state. Bundle a TypeScript Lambda handler and ship it via S3, or build and publish a container to ECR, without writing any of the glue.',
    code: `code: Code.fromAsset("lambda")`,
    accent: 'brand' as const,
  },
  {
    icon: KeyRound,
    kicker: 'Ported in full',
    title: 'The IAM grant SDK',
    body: 'IPrincipal, IGrantable and IGrant, implemented on top of terraform-provider-aws IAM resources. Cross-service policy is generated from the object graph: a queue can grant a function permission to consume it, and neither construct needs to know the other\u2019s type.',
    code: `table.grantReadWriteData(handler)`,
    accent: 'brand' as const,
  },
  {
    icon: Workflow,
    kicker: 'Ported in full',
    title: 'Step Functions ASL',
    body: 'Compose state machine fragments as objects instead of hand-editing a large JSON DSL. Because fragments are IGrantable-aware, the IAM actions each task needs bubble up and aggregate onto the state machine role automatically.',
    code: `definition: submit.next(waitFor).next(publish)`,
    accent: 'brand' as const,
  },
  {
    icon: Layers,
    kicker: 'Roadmap',
    title: 'Beyond AWS',
    body: 'The construct model is provider-agnostic; the current library covers the ported AWS CDK surface. L2 constructs for GCP and Azure are the next milestone \u2014 and the contribution path is open.',
    code: `// terraconstructs/lib/gcp \u2014 in progress`,
    accent: 'doc' as const,
    href: LINKS.githubOrg,
  },
]

export function Capabilities() {
  return (
    <section id="capabilities" className="scroll-mt-16 border-b">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="max-w-2xl">
          <span className="label-mono">What works today</span>
          <h2 className="mt-4 text-balance text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
            Not a thin wrapper. The parts of CDK that were hard to build.
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            Anyone can generate HCL from a template. These are the subsystems that make the
            programming model actually feel different — each one ported and in use.
          </p>
        </div>

        <div className="mt-12 grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2">
          {CAPABILITIES.map((cap) => {
            const Icon = cap.icon
            const Wrapper = cap.href ? 'a' : 'div'
            return (
              <Wrapper
                key={cap.title}
                {...(cap.href ? { href: cap.href, target: '_blank', rel: 'noreferrer' } : {})}
                className="group flex flex-col gap-4 bg-background p-6 transition-colors hover:bg-card/60 sm:p-8"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={
                      cap.accent === 'brand'
                        ? 'flex size-8 items-center justify-center rounded-md bg-brand-muted text-brand'
                        : 'flex size-8 items-center justify-center rounded-md bg-doc-muted text-doc'
                    }
                  >
                    <Icon className="size-4" />
                  </span>
                  <span
                    className={
                      cap.accent === 'brand'
                        ? 'font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-brand'
                        : 'font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-doc'
                    }
                  >
                    {cap.kicker}
                  </span>
                </div>

                <h3 className="text-lg font-medium tracking-tight">{cap.title}</h3>
                <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                  {cap.body}
                </p>
                <code className="mt-auto block overflow-x-auto rounded-md border bg-surface px-3 py-2 font-mono text-xs text-foreground/80">
                  {cap.code}
                </code>
              </Wrapper>
            )
          })}
        </div>
      </div>
    </section>
  )
}
