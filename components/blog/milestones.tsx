import { ArrowUpRight, Flag, RefreshCw, Rocket, Star, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const ICONS = {
  launch: Rocket,
  update: RefreshCw,
  feature: Star,
  community: Users,
  milestone: Flag,
} as const

type Milestone = {
  date: string
  title: string
  description?: string
  link?: { url: string; label: string }
  icon?: keyof typeof ICONS
}

function Entry({ item }: { item: Milestone }) {
  return (
    <>
      <span className="label-mono text-brand">{item.date}</span>
      <h4 className="mt-1 font-medium text-foreground">{item.title}</h4>
      {item.description ? (
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
      ) : null}
      {item.link ? (
        <a
          href={item.link.url}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-xs text-brand hover:underline"
        >
          {item.link.label}
          <ArrowUpRight className="size-3" aria-hidden />
        </a>
      ) : null}
    </>
  )
}

/**
 * Timeline of project milestones.
 *
 * Alternates left/right around a centre rail on wide screens, and collapses to
 * a single left-hand rail below `md` — the original alternating layout used
 * fixed 50% columns, which left each entry in a ~2-word-wide column on a phone.
 */
export function Milestones({ items }: { items: Milestone[] }) {
  return (
    <div className="relative mt-8">
      {/* the rail: hard left on small screens, centred once entries alternate */}
      <div className="absolute inset-y-0 left-[0.8125rem] w-px bg-brand/30 md:left-1/2 md:-translate-x-1/2" />

      <div className="flex flex-col gap-6">
        {items.map((item, index) => {
          const Icon = ICONS[item.icon ?? 'milestone']
          const isLeft = index % 2 === 0

          return (
            <div key={item.title} className="group relative md:flex md:items-center">
              <div
                className={cn(
                  'absolute left-0 top-0 z-10 flex size-7 items-center justify-center rounded-full',
                  'bg-brand text-brand-foreground ring-4 ring-background transition-transform',
                  'group-hover:scale-110 md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2',
                )}
              >
                <Icon className="size-3.5" aria-hidden />
              </div>

              <div
                className={cn(
                  'pl-11 md:w-[calc(50%-1.75rem)] md:pl-0',
                  isLeft ? 'md:pr-7 md:text-right' : 'md:ml-auto md:pl-7',
                )}
              >
                <Entry item={item} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
