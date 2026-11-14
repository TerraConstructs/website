'use client'

import { useEffect, useId, useState, type FormEvent } from 'react'
import { Loader2, Mail, Sparkles, Trophy, UserRound, X } from 'lucide-react'
import { dismissInvite, ensureLoaded, joinBoard, leaveBoard, useProgress } from '@/lib/progress/store'

/**
 * The optional, playful sign-up. It appears only once the reader has some
 * progress, never blocks anything, and can be dismissed for good. Anonymous
 * attendees are just a number on the facilitator's dashboard.
 */
export function BoardInvite() {
  const progress = useProgress()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<{ text: string; field?: string } | null>(null)
  const id = useId()
  useEffect(() => {
    void ensureLoaded()
  }, [])

  if (progress.status !== 'ready' || !progress.session) return null

  if (progress.profile) {
    return (
      <p className="mt-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground" data-testid="board-joined">
        <Trophy className="size-3.5 text-brand" aria-hidden />
        You are on the board as <span className="font-medium text-foreground">{progress.profile.displayName}</span>.
        <button
          type="button"
          onClick={() => void leaveBoard()}
          className="rounded px-1 text-xs underline decoration-brand/40 underline-offset-[3px] transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Take me off
        </button>
      </p>
    )
  }

  if (progress.inviteDismissed || Object.keys(progress.steps).length === 0) return null

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setPending(true)
    const r = await joinBoard(name.trim(), email.trim())
    setPending(false)
    setError(r.ok ? null : { text: r.message, field: r.field })
  }

  const input =
    'w-full rounded-md border bg-background py-2 pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

  return (
    <section aria-labelledby={`${id}-title`} className="relative mt-6 rounded-lg border border-brand/25 bg-brand-muted/40 p-5" data-testid="board-invite">
      <button
        type="button"
        onClick={dismissInvite}
        aria-label="No thanks, stay anonymous"
        className="absolute right-3 top-3 rounded p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <X className="size-3.5" aria-hidden />
      </button>
      <div className="flex items-start gap-3">
        <Trophy className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
        <div className="min-w-0 flex-1">
          <h2 id={`${id}-title`} className="text-sm font-medium text-foreground">
            Put yourself on the board
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The facilitator&apos;s screen shows who is where. Pick a display name (an email is optional) and your
            segments show up next to it. Rather not? Your progress works the same anonymously.
          </p>
          <form onSubmit={onSubmit} className="mt-4 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <div className="relative">
              <UserRound className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <label htmlFor={`${id}-name`} className="sr-only">
                Display name
              </label>
              <input
                id={`${id}-name`}
                required
                maxLength={40}
                autoComplete="nickname"
                placeholder="Display name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={error?.field === 'displayName' || undefined}
                className={input}
              />
            </div>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <label htmlFor={`${id}-email`} className="sr-only">
                Email (optional)
              </label>
              <input
                id={`${id}-email`}
                type="email"
                maxLength={120}
                autoComplete="email"
                placeholder="Email (optional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={error?.field === 'email' || undefined}
                className={input}
              />
            </div>
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center justify-center gap-1.5 rounded-md border border-brand/40 bg-brand-muted px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
            >
              {pending ? <Loader2 className="size-3.5 motion-safe:animate-spin" aria-hidden /> : <Sparkles className="size-3.5" aria-hidden />}
              I&apos;m in
            </button>
          </form>
          <p role="status" aria-live="polite" className="mt-2 min-h-5 text-sm text-progress-unverified">
            {error?.text ?? ''}
          </p>
        </div>
      </div>
    </section>
  )
}
