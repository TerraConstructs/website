'use client'

import { Dialog } from '@base-ui/react/dialog'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import type { WorkshopNode } from '@/lib/workshops'
import { WorkshopSidebar } from './workshop-sidebar'

/**
 * Small-screen access to the chapter tree, which is otherwise hidden below `lg`.
 *
 * Built on base-ui's Dialog so focus trapping, scroll locking and Esc-to-close
 * come from the primitive rather than being hand-rolled. The tree scrolls inside
 * the drawer instead of pushing the article down — it is 41 pages deep.
 */
export function WorkshopNavDrawer({ tree, title }: { tree: WorkshopNode; title: string }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Navigating from inside the drawer should dismiss it; the route changes but
  // the drawer is never unmounted, so it would otherwise stay open over the
  // page the reader just asked for.
  useEffect(() => setOpen(false), [pathname])

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <div className="sticky top-14 z-30 -mx-4 mb-6 flex items-center gap-3 border-b bg-background/95 px-4 py-2.5 backdrop-blur sm:-mx-6 sm:px-6 lg:hidden">
        <Dialog.Trigger
          className="flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm font-medium transition-colors hover:border-brand/40"
        >
          <Menu className="size-4" aria-hidden />
          Contents
        </Dialog.Trigger>
        <span className="truncate text-sm text-muted-foreground">{title}</span>
      </div>

      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 transition-opacity duration-200" />
        <Dialog.Popup
          className={
            'fixed inset-y-0 left-0 z-50 flex w-[85vw] max-w-sm flex-col border-r bg-background ' +
            'transition-transform duration-200 data-[ending-style]:-translate-x-full data-[starting-style]:-translate-x-full'
          }
        >
          <div className="flex items-center justify-between border-b px-5 py-3">
            <Dialog.Title className="label-mono">Workshop contents</Dialog.Title>
            <Dialog.Close
              aria-label="Close contents"
              className="flex size-8 items-center justify-center rounded-md border text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="size-4" aria-hidden />
            </Dialog.Close>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            <WorkshopSidebar tree={tree} />
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
