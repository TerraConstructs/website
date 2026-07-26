import Link from 'next/link'
import type { MDXComponents } from 'mdx/types'
import { cn } from '@/lib/utils'
import { CodeBlock } from './code-block'
import { Callout } from './callout'
import { SplitCompare } from './split-compare'

/**
 * Components available to every MDX post. `Callout`, `SplitCompare` and
 * `CodeBlock` can be used directly in markdown without importing.
 */
export const mdxComponents: MDXComponents = {
  Callout,
  SplitCompare,
  CodeBlock,

  h2: ({ className, ...props }) => (
    <h2
      className={cn(
        'group mt-14 scroll-mt-24 text-pretty text-2xl font-medium tracking-tight',
        className,
      )}
      {...props}
    />
  ),
  h3: ({ className, ...props }) => (
    <h3
      className={cn('mt-10 scroll-mt-24 text-pretty text-lg font-medium', className)}
      {...props}
    />
  ),
  p: ({ className, ...props }) => (
    <p className={cn('mt-5 text-pretty leading-relaxed text-muted-foreground', className)} {...props} />
  ),
  a: ({ href = '', className, ...props }) => {
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
  ul: ({ className, ...props }) => (
    <ul className={cn('mt-5 flex list-disc flex-col gap-2 pl-5 text-muted-foreground', className)} {...props} />
  ),
  ol: ({ className, ...props }) => (
    <ol className={cn('mt-5 flex list-decimal flex-col gap-2 pl-5 text-muted-foreground', className)} {...props} />
  ),
  li: ({ className, ...props }) => (
    <li className={cn('text-pretty leading-relaxed', className)} {...props} />
  ),
  strong: ({ className, ...props }) => (
    <strong className={cn('font-medium text-foreground', className)} {...props} />
  ),
  blockquote: ({ className, ...props }) => (
    <blockquote
      className={cn(
        'mt-6 border-l-2 border-brand/50 pl-5 text-pretty italic leading-relaxed text-foreground/80',
        className,
      )}
      {...props}
    />
  ),
  hr: ({ className, ...props }) => <hr className={cn('mt-12 border-t', className)} {...props} />,
  table: ({ className, ...props }) => (
    <div className="mt-6 overflow-x-auto rounded-lg border">
      <table className={cn('w-full border-collapse text-sm', className)} {...props} />
    </div>
  ),
  th: ({ className, ...props }) => (
    <th
      className={cn('border-b bg-surface px-4 py-2.5 text-left font-medium', className)}
      {...props}
    />
  ),
  td: ({ className, ...props }) => (
    <td className={cn('border-b px-4 py-2.5 align-top text-muted-foreground', className)} {...props} />
  ),
  code: ({ className, ...props }) => (
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
  pre: ({ children }) => {
    const child = children as
      | { props?: { className?: string; children?: string } }
      | undefined
    const lang = /language-(\w+)/.exec(child?.props?.className ?? '')?.[1] ?? 'text'
    const code = String(child?.props?.children ?? '').replace(/\n$/, '')
    return <CodeBlock code={code} lang={lang} />
  },
}
