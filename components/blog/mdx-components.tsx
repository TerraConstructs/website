import Link from 'next/link'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { CodeBlock } from './code-block'
import { Callout } from './callout'
import { SplitCompare } from './split-compare'
import { Milestones } from './milestones'
import { Stats } from './stats'
import { DiagramFigure } from './diagram-figure'
import { CfnScanExplainer, ClaudeNativePipeline, GranularityAB, MastraPipeline } from './diagrams/terratitan'

/**
 * Components available to every MDX post. These can be used directly in
 * markdown without importing.
 */
export const mdxComponents = {
  Callout,
  SplitCompare,
  CodeBlock,
  Milestones,
  Stats,
  DiagramFigure,
  MastraPipeline,
  CfnScanExplainer,
  ClaudeNativePipeline,
  GranularityAB,

  h2: ({ className, ...props }: ComponentPropsWithoutRef<'h2'>) => (
    <h2
      className={cn(
        'group mt-14 scroll-mt-24 text-pretty text-2xl font-medium tracking-tight',
        className,
      )}
      {...props}
    />
  ),
  h3: ({ className, ...props }: ComponentPropsWithoutRef<'h3'>) => (
    <h3
      className={cn('mt-10 scroll-mt-24 text-pretty text-lg font-medium', className)}
      {...props}
    />
  ),
  p: ({ className, ...props }: ComponentPropsWithoutRef<'p'>) => (
    <p className={cn('mt-5 text-pretty leading-relaxed text-muted-foreground', className)} {...props} />
  ),
  a: ({ href = '', className, ...props }: ComponentPropsWithoutRef<'a'>) => {
    const external = /^https?:\/\//.test(href)
    const style = cn(
      'font-medium text-foreground underline decoration-brand/40 underline-offset-[3px] transition-colors hover:decoration-brand',
      className,
    )
    return external ? (
      <a href={href} target="_blank" rel="noreferrer" className={style} {...props} />
    ) : (
      <Link href={href} className={style} {...props} />
    )
  },
  ul: ({ className, ...props }: ComponentPropsWithoutRef<'ul'>) => (
    <ul className={cn('mt-5 flex list-disc flex-col gap-2 pl-5 text-muted-foreground', className)} {...props} />
  ),
  ol: ({ className, ...props }: ComponentPropsWithoutRef<'ol'>) => (
    <ol className={cn('mt-5 flex list-decimal flex-col gap-2 pl-5 text-muted-foreground', className)} {...props} />
  ),
  li: ({ className, ...props }: ComponentPropsWithoutRef<'li'>) => (
    <li className={cn('text-pretty leading-relaxed', className)} {...props} />
  ),
  strong: ({ className, ...props }: ComponentPropsWithoutRef<'strong'>) => (
    <strong className={cn('font-medium text-foreground', className)} {...props} />
  ),
  blockquote: ({ className, ...props }: ComponentPropsWithoutRef<'blockquote'>) => (
    <blockquote
      className={cn(
        'mt-6 border-l-2 border-brand/50 pl-5 text-pretty italic leading-relaxed text-foreground/80',
        className,
      )}
      {...props}
    />
  ),
  hr: ({ className, ...props }: ComponentPropsWithoutRef<'hr'>) => (
    <hr className={cn('mt-12 border-t', className)} {...props} />
  ),
  table: ({ className, ...props }: ComponentPropsWithoutRef<'table'>) => (
    <div className="mt-6 overflow-x-auto rounded-lg border">
      <table className={cn('w-full border-collapse text-sm', className)} {...props} />
    </div>
  ),
  th: ({ className, ...props }: ComponentPropsWithoutRef<'th'>) => (
    <th
      className={cn('border-b bg-surface px-4 py-2.5 text-left font-medium', className)}
      {...props}
    />
  ),
  td: ({ className, ...props }: ComponentPropsWithoutRef<'td'>) => (
    <td className={cn('border-b px-4 py-2.5 align-top text-muted-foreground', className)} {...props} />
  ),
  code: ({ className, ...props }: ComponentPropsWithoutRef<'code'>) => (
    <code
      className={cn(
        'rounded border bg-surface px-1.5 py-0.5 font-mono text-[0.8125em] text-foreground',
        className,
      )}
      {...props}
    />
  ),
  // Fenced code blocks arrive as <pre><code class="language-x">. Hand them to
  // the Shiki-backed CodeBlock instead of rendering a bare <pre>.
  pre: ({ children }: { children?: ReactNode }) => {
    const child = children as
      | { props?: { className?: string; children?: string; meta?: string } }
      | undefined
    const lang = /language-(\w+)/.exec(child?.props?.className ?? '')?.[1] ?? 'text'
    const code = String(child?.props?.children ?? '').replace(/\n$/, '')
    return <CodeBlock code={code} lang={lang} meta={child?.props?.meta} />
  },
}
