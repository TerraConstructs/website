import { BookOpen, Code, Globe, Mic, Video, Coins, Bot, Network } from 'lucide-react'
import { cn } from '@/lib/utils'

const ICONS = { mic: Mic, video: Video, book: BookOpen, globe: Globe, code: Code, coins: Coins, bot: Bot, network: Network } as const

type Stat = {
  value: string
  label: string
  icon?: keyof typeof ICONS
}

/**
 * A row of headline metrics. Auto-fits rather than using a fixed column count,
 * so three stats sit on one line on a laptop and stack on a phone without the
 * component needing to know how many it was given.
 */
export function Stats({ items }: { items: Stat[] }) {
  return (
    <div
      className="mt-6 grid gap-3"
      style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))' }}
    >
      {items.map((stat) => {
        const Icon = stat.icon ? ICONS[stat.icon] : null
        return (
          <div
            key={stat.label}
            className={cn(
              'group flex items-center gap-3 rounded-lg border bg-surface px-4 py-3',
              'transition-colors hover:border-brand/40',
            )}
          >
            {Icon ? <Icon className="size-5 shrink-0 text-brand" aria-hidden /> : null}
            <div className="min-w-0">
              <div className="text-2xl font-medium leading-tight text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
