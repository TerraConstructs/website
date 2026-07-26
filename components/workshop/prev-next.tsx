import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'

type Neighbour = { title: string; href: string } | null

/**
 * Replaces Hugo's `nextprevlinks` shortcode, which used to be pasted at the
 * bottom of all 35 pages. Ordering comes from the content tree.
 */
export function PrevNext({ prev, next }: { prev: Neighbour; next: Neighbour }) {
  if (!prev && !next) return null

  return (
    <nav aria-label="Workshop pagination" className="mt-14 grid gap-3 border-t pt-6 sm:grid-cols-2">
      {prev ? (
        <Link
          href={prev.href}
          className="group flex flex-col gap-1 rounded-lg border p-4 transition-colors hover:border-brand/40"
        >
          <span className="label-mono flex items-center gap-1.5">
            <ArrowLeft className="size-3" />
            Previous
          </span>
          <span className="text-sm font-medium text-foreground group-hover:text-brand">
            {prev.title}
          </span>
        </Link>
      ) : (
        <span aria-hidden />
      )}

      {next ? (
        <Link
          href={next.href}
          className="group flex flex-col gap-1 rounded-lg border p-4 text-right transition-colors hover:border-brand/40 sm:col-start-2"
        >
          <span className="label-mono flex items-center justify-end gap-1.5">
            Next
            <ArrowRight className="size-3" />
          </span>
          <span className="text-sm font-medium text-foreground group-hover:text-brand">
            {next.title}
          </span>
        </Link>
      ) : null}
    </nav>
  )
}
