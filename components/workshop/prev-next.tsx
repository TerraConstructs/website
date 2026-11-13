import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ProgressNextLink } from './progress/next-link'

type Neighbour = { title: string; href: string } | null

/**
 * Replaces Hugo's `nextprevlinks` shortcode, which used to be pasted at the
 * bottom of all 35 pages. Ordering comes from the content tree. "Next" also
 * records progress (and runs the page's check, if it has one).
 */
export function PrevNext({
  prev,
  next,
  stepId,
  verifies,
}: {
  prev: Neighbour
  next: Neighbour
  stepId: string
  verifies: boolean
}) {
  return (
    <nav aria-label="Workshop pagination" className="mt-14 grid grid-cols-1 gap-3 border-t pt-6 sm:grid-cols-2">
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

      <ProgressNextLink next={next} stepId={stepId} verifies={verifies} />
    </nav>
  )
}
