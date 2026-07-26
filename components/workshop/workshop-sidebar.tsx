'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import type { WorkshopNode } from '@/lib/workshops'
import { cn } from '@/lib/utils'

/** True when `href` is the current page or an ancestor of it. */
const onPath = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`)

function NodeLink({ node, pathname, depth }: { node: WorkshopNode; pathname: string; depth: number }) {
  const active = pathname === node.href
  const inPath = onPath(pathname, node.href)
  // sections start open when the reader is somewhere inside them
  const [open, setOpen] = useState(inPath)

  const link = (
    <Link
      href={node.href}
      className={cn(
        'block flex-1 rounded-md py-1.5 pr-2 text-sm leading-snug transition-colors',
        active
          ? 'font-medium text-brand'
          : inPath
            ? 'text-foreground hover:text-brand'
            : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {node.title}
    </Link>
  )

  if (node.children.length === 0) {
    return <li style={{ paddingLeft: depth * 12 }}>{link}</li>
  }

  return (
    <li style={{ paddingLeft: depth * 12 }}>
      <div className="flex items-start gap-1">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={`${open ? 'Collapse' : 'Expand'} ${node.title}`}
          className="mt-1.5 shrink-0 rounded text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronRight className={cn('size-3.5 transition-transform', open && 'rotate-90')} />
        </button>
        {link}
      </div>
      {open ? (
        <ul>
          {node.children.map((child) => (
            <NodeLink key={child.href} node={child} pathname={pathname} depth={depth + 1} />
          ))}
        </ul>
      ) : null}
    </li>
  )
}

export function WorkshopSidebar({ tree }: { tree: WorkshopNode }) {
  const pathname = usePathname()

  return (
    <nav aria-label="Workshop contents" className="text-sm">
      <Link
        href={tree.href}
        className={cn(
          'label-mono block transition-colors hover:text-foreground',
          pathname === tree.href && 'text-brand',
        )}
      >
        {tree.title}
      </Link>
      <ul className="mt-4 flex flex-col gap-0.5">
        {tree.children.map((node) => (
          <NodeLink key={node.href} node={node} pathname={pathname} depth={0} />
        ))}
      </ul>
    </nav>
  )
}
