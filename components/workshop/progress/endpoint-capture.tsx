'use client'

import { useEffect, useId, useState, type FormEvent } from 'react'
import { Check, Link2, Loader2, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ensureLoaded, saveEndpoint, useProgress } from '@/lib/progress/store'
import { EXAMPLE_ENDPOINTS, type EndpointSlot } from '@/lib/progress/model'

const COPY: Record<EndpointSlot, { title: string; hint: string }> = {
  api: {
    title: 'Your endpoint',
    hint: 'Paste the url from your EndpointOutputs. The commands on these pages will use it, and "Next" checks it against what each page expects.',
  },
  viewer: {
    title: 'Your table viewer endpoint',
    hint: 'Paste the url from your ViewerEndpointOutputs. "Next" reads your hit counts from it.',
  },
}

/**
 * Shown on the page where an endpoint first exists (frontmatter `progress.capture`).
 * The Worker validates and stores it; with the Worker unreachable a genuine API
 * Gateway URL is still kept in this browser for the code blocks.
 */
export function EndpointCapture({ slot }: { slot: EndpointSlot }) {
  const progress = useProgress()
  const saved = progress.endpoints[slot]
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState('')
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const inputId = useId()
  const msgId = useId()
  useEffect(() => {
    void ensureLoaded()
  }, [])

  const showForm = !saved || editing

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!value.trim()) return
    setPending(true)
    const r = await saveEndpoint(slot, value)
    setPending(false)
    if (r.ok) {
      setEditing(false)
      setValue('')
      setMessage({ ok: true, text: r.synced ? 'Saved. The commands on this page and the pages after it now use your endpoint.' : 'Saved in this browser (progress tracking is offline).' })
    } else {
      setMessage({ ok: false, text: r.message })
    }
  }

  return (
    <section
      aria-labelledby={`${inputId}-title`}
      className="mt-10 rounded-lg border bg-surface p-5"
      data-testid={`endpoint-capture-${slot}`}
      data-progress-ui
    >
      <div className="flex items-start gap-3">
        <Link2 className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
        <div className="min-w-0 flex-1">
          <h2 id={`${inputId}-title`} className="text-sm font-medium text-foreground">
            {COPY[slot].title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{COPY[slot].hint}</p>

          {showForm ? (
            <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row">
              <label htmlFor={inputId} className="sr-only">
                {COPY[slot].title}
              </label>
              <input
                id={inputId}
                type="url"
                inputMode="url"
                autoComplete="off"
                spellCheck={false}
                required
                maxLength={200}
                placeholder={EXAMPLE_ENDPOINTS[slot]}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                aria-describedby={msgId}
                className="min-w-0 flex-1 rounded-md border bg-background px-3 py-2 font-mono text-[0.8125rem] text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <button
                type="submit"
                disabled={pending}
                className="inline-flex items-center justify-center gap-1.5 rounded-md border border-brand/40 bg-brand-muted px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
              >
                {pending ? <Loader2 className="size-3.5 motion-safe:animate-spin" aria-hidden /> : null}
                Save endpoint
              </button>
            </form>
          ) : (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Check className="size-3.5 text-progress-verified" aria-hidden />
              <code className="min-w-0 break-all rounded border bg-background px-1.5 py-0.5 font-mono text-[0.8125rem] text-foreground">
                {saved}
              </code>
              <button
                type="button"
                onClick={() => {
                  setEditing(true)
                  setMessage(null)
                }}
                className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Pencil className="size-3" aria-hidden />
                Change
              </button>
            </div>
          )}

          <p
            id={msgId}
            role="status"
            aria-live="polite"
            className={cn('mt-2 min-h-5 text-sm', message?.ok ? 'text-muted-foreground' : 'text-progress-unverified')}
          >
            {message?.text ?? ''}
          </p>
        </div>
      </div>
    </section>
  )
}
