'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, Play, RotateCcw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Demo, TourStep } from '@/lib/demos'
import { CodePaneView } from './code-pane'

type FlatStep = TourStep & { pane: 'input' | 'output' }

export function GuidedTour({ demos }: { demos: Demo[] }) {
  const [demoId, setDemoId] = useState(demos[0]?.id ?? '')
  const demo = demos.find((d) => d.id === demoId) ?? demos[0]

  // -1 means "not started" — the tour never auto-plays.
  const [index, setIndex] = useState(-1)

  const steps = useMemo<FlatStep[]>(
    () =>
      demo
        ? [
            ...demo.tour.inputSteps.map((s) => ({ ...s, pane: 'input' as const })),
            ...demo.tour.outputSteps.map((s) => ({ ...s, pane: 'output' as const })),
          ]
        : [],
    [demo],
  )

  const started = index >= 0
  const current = started ? steps[index] : null

  const go = useCallback(
    (next: number) => setIndex(Math.max(0, Math.min(steps.length - 1, next))),
    [steps.length],
  )

  const selectById = useCallback(
    (id: string) => {
      const i = steps.findIndex((s) => s.id === id)
      if (i >= 0) setIndex(i)
    },
    [steps],
  )

  // Arrow-key navigation once the reader has opted in.
  useEffect(() => {
    if (!started) return
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) return
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        go(index + 1)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        go(index - 1)
      } else if (e.key === 'Escape') {
        setIndex(-1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [started, index, go])

  if (!demo) return null

  const inputActive = current?.pane === 'input' ? current : null
  const outputActive = current?.pane === 'output' ? current : null

  return (
    <div className="rounded-xl border bg-card/40">
      {/* header: demo selector + start/exit */}
      <div className="flex flex-wrap items-center gap-3 border-b p-3 sm:p-4">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          {demos.length > 1 ? (
            <div
              role="tablist"
              aria-label="Choose a demo"
              className="flex flex-wrap gap-1 rounded-md border bg-background/50 p-1"
            >
              {demos.map((d) => (
                <button
                  key={d.id}
                  role="tab"
                  aria-selected={d.id === demoId}
                  onClick={() => {
                    setDemoId(d.id)
                    setIndex(-1)
                  }}
                  className={cn(
                    'rounded px-2.5 py-1 font-mono text-[0.6875rem] transition-colors',
                    d.id === demoId
                      ? 'bg-brand text-brand-foreground'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {d.id}
                </button>
              ))}
            </div>
          ) : (
            <span className="label-mono">{demo.name}</span>
          )}
          <p className="min-w-0 text-sm text-muted-foreground">{demo.description}</p>
        </div>

        {!started ? (
          <Button size="sm" onClick={() => setIndex(0)} className="shrink-0 gap-1.5">
            <Play className="size-3.5" />
            Start guided tour
            <span className="ml-1 font-mono text-[0.6875rem] opacity-70">
              {steps.length} steps
            </span>
          </Button>
        ) : (
          <div className="flex shrink-0 items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIndex(0)}
              className="gap-1.5"
              disabled={index === 0}
            >
              <RotateCcw className="size-3.5" />
              <span className="sr-only sm:not-sr-only">Restart</span>
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setIndex(-1)} className="gap-1.5">
              <X className="size-3.5" />
              <span className="sr-only sm:not-sr-only">Exit</span>
            </Button>
          </div>
        )}
      </div>

      {/* code panes */}
      <div className="grid gap-3 p-3 sm:p-4 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="label-mono">Input · TypeScript</span>
            <span className="font-mono text-[0.6875rem] text-brand">objects</span>
          </div>
          <CodePaneView
            pane={demo.input}
            activeStep={inputActive}
            steps={demo.tour.inputSteps}
            onSelectStep={selectById}
            accent="brand"
            maxHeightClass="h-[300px] lg:h-[440px]"
          />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="label-mono">Output · HCL</span>
            <span className="font-mono text-[0.6875rem] text-doc">
              {demo.output.lineCount} lines synthesized
            </span>
          </div>
          <CodePaneView
            pane={demo.output}
            activeStep={outputActive}
            steps={demo.tour.outputSteps}
            onSelectStep={selectById}
            accent="doc"
            maxHeightClass="h-[300px] lg:h-[440px]"
          />
        </div>
      </div>

      {/* narration */}
      <div className="border-t p-3 sm:p-4">
        {!started ? (
          <p className="text-sm text-muted-foreground">
            Both files above are real: 27 lines of TypeScript on the left, the{' '}
            {demo.output.lineCount} lines of HCL{' '}
            <code className="font-mono text-xs text-foreground">cdktn synth</code> produced from
            them on the right. Highlighted regions are clickable, or step through them in order.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  'mt-0.5 shrink-0 rounded px-1.5 py-0.5 font-mono text-[0.6875rem]',
                  current!.pane === 'input'
                    ? 'bg-brand-muted text-brand'
                    : 'bg-doc-muted text-doc',
                )}
              >
                {current!.pane === 'input' ? 'TS' : 'HCL'} L{current!.startLine}–
                {current!.endLine}
              </span>
              <div className="min-w-0">
                <h3 className="text-sm font-medium">{current!.title}</h3>
                <p className="mt-1 text-pretty text-sm leading-relaxed text-muted-foreground">
                  {current!.content}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => go(index - 1)}
                disabled={index === 0}
                className="gap-1.5"
              >
                <ArrowLeft className="size-3.5" />
                Prev
              </Button>

              <div className="flex flex-1 items-center gap-1" role="tablist" aria-label="Tour steps">
                {steps.map((s, i) => (
                  <button
                    key={s.id}
                    role="tab"
                    aria-selected={i === index}
                    aria-label={s.title}
                    onClick={() => setIndex(i)}
                    className={cn(
                      'h-1 flex-1 rounded-full transition-colors',
                      i === index
                        ? s.pane === 'input'
                          ? 'bg-brand'
                          : 'bg-doc'
                        : i < index
                          ? 'bg-foreground/25'
                          : 'bg-foreground/10 hover:bg-foreground/20',
                    )}
                  />
                ))}
              </div>

              <span className="shrink-0 font-mono text-[0.6875rem] text-muted-foreground tabular-nums">
                {index + 1}/{steps.length}
              </span>

              <Button
                size="sm"
                onClick={() => go(index + 1)}
                disabled={index === steps.length - 1}
                className="gap-1.5"
              >
                Next
                <ArrowRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
