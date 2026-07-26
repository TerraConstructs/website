import Link from 'next/link'
import { cn } from '@/lib/utils'

/**
 * Isometric stacked-block hexagon, matching the favicon.
 * Three faces per block: light top, mid-left, dark-right.
 */
export function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn('size-6', className)}
      aria-hidden
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* upper block */}
      <path d="M32 6 L52 17.5 L32 29 L12 17.5 Z" className="fill-brand" />
      <path d="M12 17.5 L32 29 L32 40.5 L12 29 Z" className="fill-brand opacity-70" />
      <path d="M52 17.5 L52 29 L32 40.5 L32 29 Z" className="fill-brand opacity-45" />
      {/* lower block */}
      <path d="M32 35 L52 46.5 L32 58 L12 46.5 Z" className="fill-brand opacity-90" />
      <path d="M12 46.5 L32 58 L32 58 L12 46.5 Z" className="fill-brand opacity-70" />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        'group flex items-center gap-2 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
    >
      <Mark className="size-6 transition-transform duration-300 group-hover:-translate-y-0.5" />
      <span className="font-mono text-sm font-medium tracking-tight">
        terra<span className="text-muted-foreground">constructs</span>
      </span>
    </Link>
  )
}
