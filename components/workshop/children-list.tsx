import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getWorkshopChildren } from '@/lib/workshops'

/**
 * The MDX stand-in for Hugo's `children` shortcode: inline links to the child
 * pages of the current section.
 */
export async function ChildrenList({ segments }: { segments: string[] }) {
  const children = await getWorkshopChildren(segments)
  if (children.length === 0) return null

  return (
    <ul className="mt-5 flex flex-col gap-2">
      {children.map((child) => (
        <li key={child.href}>
          <Link
            href={child.href}
            className="group flex items-center gap-2 rounded-md border px-3.5 py-2.5 text-sm transition-colors hover:border-brand/40"
          >
            <ArrowRight className="size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-brand" />
            <span className="font-medium text-foreground group-hover:text-brand">{child.title}</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
