'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import type { CodePane, TourStep } from '@/lib/demos'

type Props = {
  pane: CodePane
  /** the step currently being narrated, if it belongs to this pane */
  activeStep: TourStep | null
  /** every step for this pane, so inactive ranges can still be hinted */
  steps: TourStep[]
  onSelectStep?: (id: string) => void
  accent: 'brand' | 'doc'
  className?: string
  maxHeightClass?: string
}

function inRange(line: number, step: TourStep) {
  return line >= step.startLine && line <= step.endLine
}

export function CodePaneView({
  pane,
  activeStep,
  steps,
  onSelectStep,
  accent,
  className,
  maxHeightClass = 'h-[420px]',
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLDivElement>(null)

  // Keep the highlighted range centered as the reader steps through.
  useEffect(() => {
    if (!activeStep || !activeRef.current || !scrollRef.current) return
    const container = scrollRef.current
        const target = activeRef.current
    const top = target.offsetTop - container.clientHeight / 2 + target.clientHeight / 2
    container.scrollTo({
      top: Math.max(0, top),
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    })
  }, [activeStep])

  const gutterWidth = String(pane.lineCount).length

  return (
    <div className={cn('relative overflow-hidden rounded-lg border bg-surface', className)}>
      <div className="flex items-center gap-2 border-b bg-background/40 px-3 py-2">
        <span
          className={cn(
            'size-1.5 rounded-full',
            accent === 'brand' ? 'bg-brand' : 'bg-doc',
          )}
          aria-hidden
        />
        <span className="truncate font-mono text-[0.6875rem] text-muted-foreground">
          {pane.label}
        </span>
        <span className="ml-auto shrink-0 font-mono text-[0.6875rem] text-muted-foreground/70">
          {pane.lineCount} lines
        </span>
      </div>

      <div
        ref={scrollRef}
        className={cn('overflow-auto overscroll-contain', maxHeightClass)}
        tabIndex={0}
        aria-label={`${pane.label} source code`}
      >
        <pre className="w-max min-w-full py-3 font-mono text-[0.75rem] leading-[1.6]">
          <code>
            {pane.lines.map((tokens, i) => {
              const lineNo = i + 1
              const active = activeStep && inRange(lineNo, activeStep) ? activeStep : null
              const hinted = !active ? steps.find((s) => inRange(lineNo, s)) : null
              const step = active ?? hinted
              const isFirst = step ? lineNo === step.startLine : false

              return (
                <div
                  key={i}
                  ref={active && isFirst ? activeRef : undefined}
                  onClick={step && onSelectStep ? () => onSelectStep(step.id) : undefined}
                  className={cn(
                    'group relative flex px-3 transition-colors duration-300',
                    step && onSelectStep && 'cursor-pointer',
                    active &&
                      (accent === 'brand'
                        ? 'bg-brand-muted'
                        : 'bg-doc-muted'),
                    !active && hinted && 'bg-foreground/[0.03] hover:bg-foreground/[0.06]',
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      'absolute inset-y-0 left-0 w-[2px] transition-colors duration-300',
                      active
                        ? accent === 'brand'
                          ? 'bg-brand'
                          : 'bg-doc'
                        : hinted
                          ? 'bg-border'
                          : 'bg-transparent',
                    )}
                  />
                  <span
                    aria-hidden
                    className="mr-4 shrink-0 select-none text-right tabular-nums text-muted-foreground/40"
                    style={{ width: `${gutterWidth}ch` }}
                  >
                    {lineNo}
                  </span>
                  <span className="whitespace-pre">
                    {tokens.length === 0 ? '\n' : null}
                    {tokens.map((t, j) => {
                      const [light, dark] = pane.palette[t[1]]
                      return (
                        <span
                          key={j}
                          style={
                            {
                              '--shiki-light': light,
                              '--shiki-dark': dark,
                            } as React.CSSProperties
                          }
                          className="text-[var(--shiki-dark)] [.light_&]:text-[var(--shiki-light)]"
                        >
                          {t[0]}
                        </span>
                      )
                    })}
                  </span>
                </div>
              )
            })}
          </code>
        </pre>
      </div>
    </div>
  )
}
