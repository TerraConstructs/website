'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, type MouseEvent, type Ref } from 'react'
import { ArrowRight, Check, CircleDashed, Flag, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { advance, reachEnd, useProgress } from '@/lib/progress/store'
import { useReducedMotion } from '@/lib/progress/reduced-motion'
import { verdictMessage } from '@/lib/progress/model'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * The "Next" card, which also tells the Worker the reader moved on (verifying
 * first on a page with a check); moving on is always allowed. It stays a plain
 * link, so modified clicks and no-JS/no-Worker just navigate. On the last page
 * it becomes a "Finish" button that records the page.
 */
export function ProgressNextLink({
  next,
  stepId,
  verifies,
}: {
  next: { title: string; href: string } | null
  stepId: string
  verifies: boolean
}) {
  const router = useRouter()
  const progress = useProgress()
  const reduced = useReducedMotion()
  const busy = progress.verifying === stepId
  const flash = progress.flash?.stepId === stepId ? progress.flash : null
  const finished = !next && Boolean(progress.steps[stepId])

  // The page counts once this card (its end) has been on screen and the reader has done something
  // that is not a click on a link: so a crawler, or clicking through the pages, records nothing.
  const card = useRef<HTMLElement | null>(null)
  useEffect(() => {
    const el = card.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    let seen = false
    let input = false
    const events = ['scroll', 'wheel', 'keydown', 'pointerdown', 'touchstart'] as const
    const stop = () => {
      io.disconnect()
      for (const n of events) window.removeEventListener(n, onInput, true)
    }
    const settle = () => {
      if (!seen || !input) return
      stop()
      reachEnd(stepId, verifies)
    }
    const onInput = (e: Event) => {
      if (!e.isTrusted) return
      const onLink = e.target instanceof Element && e.target.closest('a[href]') !== null
      if (onLink && e.type !== 'scroll' && e.type !== 'wheel') return
      input = true
      settle()
    }
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((x) => x.isIntersecting)) return
      seen = true
      settle()
    })
    io.observe(el)
    for (const n of events) window.addEventListener(n, onInput, { capture: true, passive: true })
    return stop
  }, [stepId, verifies])

  async function onClick(e: MouseEvent<HTMLElement>) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    if (busy) return
    const result = await advance(stepId, verifies)
    // let the verdict settle before the page changes; a colour change is enough with reduced motion
    if (verifies && result) await sleep(reduced ? 400 : 950)
    if (next) router.push(next.href)
  }

  let icon = next ? <ArrowRight className="size-3" aria-hidden /> : <Flag className="size-3" aria-hidden />
  let label = next ? 'Next' : finished ? 'Finished' : 'Finish'
  if (busy) {
    icon = <Loader2 className="size-3 motion-safe:animate-spin" aria-hidden />
    label = 'Verifying'
  } else if (flash?.state === 'verified') {
    icon = <Check className="size-3 text-progress-verified" aria-hidden />
    label = 'Verified'
  } else if (flash) {
    icon = <CircleDashed className="size-3 text-progress-unverified" aria-hidden />
    label = 'Not verified'
  }

  const className = cn(
    'group flex flex-col gap-1 rounded-lg border p-4 text-right transition-colors hover:border-brand/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:col-start-2',
    busy && 'tc-verify-pulse',
    flash?.state === 'verified' && 'tc-verify-glow',
  )
  const body = (
    <>
      <span className="label-mono flex items-center justify-end gap-1.5">
        {verifies && !busy && !flash ? <span data-progress-ui className="normal-case tracking-normal opacity-70">checks your endpoint ·</span> : null}
        {label}
        {icon}
      </span>
      <span className="text-sm font-medium text-foreground group-hover:text-brand">
        {next ? next.title : 'Mark the workshop complete'}
      </span>
    </>
  )
  // Outside the link, so it is not part of the link's name; polite, so the verdict never interrupts.
  // sr-only is absolutely positioned, so it takes no cell in the pagination grid.
  const status = (
    <span className="sr-only" aria-live="polite" role="status" data-progress-ui data-testid="verify-status">
      {busy ? 'Verifying this page.' : flash ? verdictMessage(flash.state, flash.reason) : ''}
    </span>
  )

  return next ? (
    <>
      <Link ref={card as Ref<HTMLAnchorElement>} href={next.href} onClick={onClick} aria-busy={busy || undefined} className={className} data-testid="next-link">
        {body}
      </Link>
      {status}
    </>
  ) : (
    <>
      <button ref={card as Ref<HTMLButtonElement>} type="button" onClick={onClick} aria-busy={busy || undefined} className={cn(className, 'w-full')} data-testid="next-link">
        {body}
      </button>
      {status}
    </>
  )
}
