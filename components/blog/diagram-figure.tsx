'use client'

import { Dialog } from '@base-ui/react/dialog'
import { useState } from 'react'
import { Maximize2, RotateCcw, X, ZoomIn, ZoomOut } from 'lucide-react'

/**
 * Chassis for the hand-drawn SVG diagrams.
 *
 * The diagrams themselves are plain `<svg viewBox>` markup rendered on the
 * server, so they scale to any width and their labels stay real, selectable
 * text. What this adds is the small-screen story: at phone widths a dense graph
 * shrinks past the point of legibility, so the inline view is deliberately a
 * *thumbnail* and the reader opens it to read it.
 *
 * Zoom is a scale transform inside a scrollable box rather than a pan/zoom
 * library — dragging is what browser scroll already does, and pinch-zoom works
 * natively because nothing intercepts touch. Cost is a couple of hundred bytes
 * of client JS, versus ~400KB for a graph runtime we would only use to draw
 * five static pictures. See the `@xyflow/react` chunk the previous site shipped
 * and never rendered.
 */
export function DiagramFigure({
  title,
  caption,
  children,
}: {
  title: string
  caption?: string
  children: React.ReactNode
}) {
  const [scale, setScale] = useState(1)

  const zoom = (delta: number) => setScale((s) => Math.min(4, Math.max(0.5, +(s + delta).toFixed(2))))

  return (
    <Dialog.Root onOpenChange={(open) => !open && setScale(1)}>
      <figure className="mt-8">
        <div className="relative overflow-hidden rounded-lg border bg-surface">
          {/* The inline diagram scales to the column; on phones it is a legible
              overview, not a readable detail view. */}
          <div className="p-4 sm:p-6 [&>svg]:h-auto [&>svg]:w-full">{children}</div>

          <Dialog.Trigger
            className="absolute right-2 top-2 flex items-center gap-1.5 rounded-md border bg-background/80 px-2 py-1.5 font-mono text-[0.6875rem] text-muted-foreground backdrop-blur transition-colors hover:border-brand/40 hover:text-foreground"
            aria-label={`Enlarge diagram: ${title}`}
          >
            <Maximize2 className="size-3" aria-hidden />
            Zoom
          </Dialog.Trigger>
        </div>

        {caption ? (
          <figcaption className="mt-3 text-pretty text-sm text-muted-foreground">
            {caption}
          </figcaption>
        ) : null}
      </figure>

      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-background/85 backdrop-blur-sm transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Popup className="fixed inset-0 z-50 flex flex-col transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0">
          <div className="flex items-center gap-3 border-b bg-background/95 px-4 py-2.5 backdrop-blur">
            <Dialog.Title className="min-w-0 flex-1 truncate text-sm font-medium">
              {title}
            </Dialog.Title>

            <div className="flex items-center gap-1">
              <button
                onClick={() => zoom(-0.25)}
                className="rounded-md border p-1.5 text-muted-foreground transition-colors hover:border-brand/40 hover:text-foreground"
                aria-label="Zoom out"
              >
                <ZoomOut className="size-4" aria-hidden />
              </button>
              <span className="w-12 text-center font-mono text-[0.6875rem] text-muted-foreground tabular-nums">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={() => zoom(0.25)}
                className="rounded-md border p-1.5 text-muted-foreground transition-colors hover:border-brand/40 hover:text-foreground"
                aria-label="Zoom in"
              >
                <ZoomIn className="size-4" aria-hidden />
              </button>
              <button
                onClick={() => setScale(1)}
                className="rounded-md border p-1.5 text-muted-foreground transition-colors hover:border-brand/40 hover:text-foreground"
                aria-label="Reset zoom"
              >
                <RotateCcw className="size-4" aria-hidden />
              </button>
            </div>

            <Dialog.Close
              className="rounded-md border p-1.5 text-muted-foreground transition-colors hover:border-brand/40 hover:text-foreground"
              aria-label="Close"
            >
              <X className="size-4" aria-hidden />
            </Dialog.Close>
          </div>

          {/* Panning is scrolling; pinch-zoom is the browser's. Nothing here
              captures touch, so both work without a gesture library. */}
          <div className="flex-1 overflow-auto overscroll-contain bg-surface p-4 [touch-action:pinch-zoom_pan-x_pan-y]">
            <div
              style={{ width: `${scale * 100}%` }}
              className="mx-auto min-w-[20rem] transition-[width] duration-150 [&>svg]:h-auto [&>svg]:w-full"
            >
              {children}
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
