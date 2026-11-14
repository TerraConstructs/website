'use client'

import { useEffect } from 'react'
import { CircleCheck, CircleDashed, CircleDot } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ensureLoaded, useProgress, visit } from '@/lib/progress/store'
import { STATE_LABEL, segmentStates, summarize, type ProgressStep, type SegmentState } from '@/lib/progress/model'

/** Shared with the dashboard: green, yellow (hatched, so colour is not the only signal), blue, empty. */
export const SEGMENT_CLASS: Record<SegmentState, string> = {
  verified: 'bg-progress-verified',
  unverified: 'tc-hatch-unverified',
  done: 'bg-progress-done',
  empty: 'bg-foreground/10',
}

/**
 * One segment per workshop page. Rendered from the static page list, so its
 * size never depends on the Worker: with the Worker unreachable it simply
 * stays as this browser last knew it (or empty).
 */
export function ProgressBar({ steps, currentId, verifies }: { steps: ProgressStep[]; currentId: string; verifies: boolean }) {
  const progress = useProgress()
  useEffect(() => {
    void ensureLoaded()
  }, [])
  useEffect(() => visit(currentId, verifies), [currentId, verifies])

  const states = segmentStates(steps, progress.steps)
  const sum = summarize(states)
  const current = steps.findIndex((s) => s.id === currentId)

  return (
    <div className="mt-6" data-testid="workshop-progress" data-progress-ui>
      <div className="flex items-center justify-between gap-3">
        <span className="label-mono">
          Page {current + 1} of {steps.length}
        </span>
        <span className="label-mono flex items-center gap-3 normal-case tracking-normal">
          <span className="flex items-center gap-1" title="Verified by the Worker">
            <CircleCheck className="size-3 text-progress-verified" aria-hidden />
            <span className="sr-only">Verified:</span>
            {sum.verified}
          </span>
          <span className="flex items-center gap-1" title="Moved on, not verified">
            <CircleDashed className="size-3 text-progress-unverified" aria-hidden />
            <span className="sr-only">Not verified:</span>
            {sum.unverified}
          </span>
          <span className="flex items-center gap-1" title="Done, nothing to verify">
            <CircleDot className="size-3 text-progress-done" aria-hidden />
            <span className="sr-only">Done:</span>
            {sum.done}
          </span>
        </span>
      </div>
      <ol aria-label="Workshop progress, one segment per page" className="mt-2 flex h-2.5 items-center gap-[2px]">
        {steps.map((step, i) => {
          const state = states[i]
          const isCurrent = i === current
          const verifying = progress.verifying === step.id
          const glow = progress.flash?.stepId === step.id && progress.flash.state === 'verified'
          return (
            <li
              key={step.id}
              title={`${i + 1}. ${step.title}: ${STATE_LABEL[state]}`}
              data-state={state}
              aria-current={isCurrent ? 'step' : undefined}
              className={cn(
                'tc-seg min-w-0 flex-1 rounded-[2px]',
                isCurrent ? 'h-2.5' : 'h-1.5',
                SEGMENT_CLASS[state],
                isCurrent && state === 'empty' && 'bg-foreground/25',
                verifying && 'tc-seg-pulse',
                glow && 'tc-seg-glow',
              )}
            >
              <span className="sr-only">
                {i + 1}. {step.title}: {STATE_LABEL[state]}
                {isCurrent ? ' (this page)' : ''}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
