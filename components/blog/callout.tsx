import { AlertTriangle, Info, Lightbulb, OctagonAlert } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * `note`/`tip`/`warning` are the blog's vocabulary; `info`/`danger` come from
 * the workshop (Hugo's notice shortcode). `info` is an alias of `note`.
 */
const VARIANTS = {
  note: { icon: Info, ring: 'border-doc/30 bg-doc-muted', tint: 'text-doc' },
  info: { icon: Info, ring: 'border-doc/30 bg-doc-muted', tint: 'text-doc' },
  tip: { icon: Lightbulb, ring: 'border-brand/30 bg-brand-muted', tint: 'text-brand' },
  warning: {
    icon: AlertTriangle,
    ring: 'border-warning/30 bg-warning-muted',
    tint: 'text-warning',
  },
  danger: {
    icon: OctagonAlert,
    ring: 'border-destructive/40 bg-destructive/[0.08]',
    tint: 'text-destructive',
  },
} as const

export function Callout({
  type = 'note',
  title,
  children,
}: {
  type?: keyof typeof VARIANTS
  title?: string
  children: React.ReactNode
}) {
  const { icon: Icon, ring, tint } = VARIANTS[type] ?? VARIANTS.note

  return (
    <aside className={cn('mt-6 flex gap-3 rounded-lg border p-4', ring)}>
      <Icon className={cn('mt-0.5 size-4 shrink-0', tint)} aria-hidden />
      <div className="min-w-0 text-sm">
        {title ? <p className="font-medium text-foreground">{title}</p> : null}
        {/* first child paragraph should not add another top margin */}
        <div className="[&>*:first-child]:mt-0 [&>p]:text-sm">{children}</div>
      </div>
    </aside>
  )
}
