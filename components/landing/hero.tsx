import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { LINKS } from '@/lib/links'

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b">
      <div
        className="grid-backdrop pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,black_0%,black_45%,transparent_100%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-brand/[0.07] to-transparent"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-16 sm:px-6 sm:pb-24 sm:pt-24">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border bg-background/60 px-2.5 py-1 font-mono text-[0.6875rem] text-muted-foreground">
            Apache-2.0
          </span>
          <a
            href={LINKS.cdktn}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 rounded-full border border-brand/40 bg-brand-muted px-2.5 py-1 font-mono text-[0.6875rem] text-brand transition-colors hover:border-brand"
          >
            built on CDK Terrain (cdktn)
            <ArrowUpRight className="size-3 opacity-60" />
          </a>
          <span className="rounded-full border bg-background/60 px-2.5 py-1 font-mono text-[0.6875rem] text-muted-foreground">
            Terraform + OpenTofu
          </span>
        </div>

        <h1 className="mt-8 max-w-4xl text-balance text-4xl font-medium leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
          Infrastructure as{' '}
          <span className="relative whitespace-nowrap">
            <span className="text-muted-foreground/40 line-through decoration-brand/60 decoration-2">
              config
            </span>
          </span>
          <br />
          is not the same as{' '}
          <span className="text-brand">code</span>.
        </h1>

        <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
          HCL, CloudFormation and Kubernetes YAML are configuration: documents you merge, look up
          and template. TerraConstructs is an L2 construct library that brings the AWS CDK
          programming model to Terraform and OpenTofu — the asset pipeline, IAM grant SDK and Step
          Functions ASL, on the providers and state you already run.
        </p>

        <a
          href={LINKS.cdktn}
          target="_blank"
          rel="noreferrer"
          className="group mt-6 flex max-w-2xl items-start gap-3 rounded-lg border border-brand/30 bg-background/70 px-4 py-3 backdrop-blur-sm transition-colors hover:border-brand/60"
        >
          <span className="mt-0.5 shrink-0 rounded bg-brand-muted px-1.5 py-0.5 font-mono text-[0.6875rem] text-brand">
            cdktn
          </span>
          <span className="text-pretty text-sm leading-relaxed text-muted-foreground">
            <span className="text-foreground">
              Built on CDK Terrain, the community-led fork of the Terraform CDK.
            </span>{' '}
            If you run a CDKTF platform today, cdktn is the maintained way forward — and
            TerraConstructs is the L2 library that runs on it.
            <ArrowUpRight className="ml-1 inline size-3.5 align-[-2px] opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </a>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/#guided-tour"
            className="group flex items-center gap-2 rounded-md bg-brand px-4 py-2.5 text-sm font-medium text-brand-foreground transition-opacity hover:opacity-90"
          >
            Take the guided tour
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <a
            href={LINKS.github}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium transition-colors hover:border-brand/40"
          >
            <svg viewBox="0 0 16 16" className="size-4" fill="currentColor" aria-hidden>
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.07-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.4 7.4 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.15 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A7.99 7.99 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
            </svg>
            terraconstructs/base
          </a>
          <Link
            href={LINKS.workshop}
            className="group flex items-center gap-1 px-1 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            AWS workshop
            <ArrowRight className="size-3.5 opacity-60 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
