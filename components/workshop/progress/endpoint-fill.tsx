'use client'

import { useEffect, useRef } from 'react'
import { ensureLoaded, useProgress } from '@/lib/progress/store'
import { EXAMPLE_ENDPOINTS, type EndpointSlot } from '@/lib/progress/model'

/**
 * Swaps the example endpoint in its code block for the attendee's own, once
 * posted. The block is server-rendered with the documented example (right
 * without JavaScript, in the Markdown twin, and with the Worker unreachable);
 * only the text inside each `[data-endpoint]` span changes.
 */
export function EndpointFill() {
  const ref = useRef<HTMLSpanElement>(null)
  const { endpoints } = useProgress()
  useEffect(() => {
    void ensureLoaded()
  }, [])
  useEffect(() => {
    const block = ref.current?.closest('figure')
    block?.querySelectorAll<HTMLElement>('[data-endpoint]').forEach((el) => {
      const slot = el.dataset.endpoint as EndpointSlot
      const own = endpoints[slot]
      const text = own ?? EXAMPLE_ENDPOINTS[slot]
      if (el.textContent !== text) el.textContent = text
      el.toggleAttribute('data-own', Boolean(own))
    })
  }, [endpoints])
  return <span ref={ref} hidden />
}

/** `<Endpoint />` in prose: the attendee's endpoint, or the documented example. */
export function EndpointText({ name = 'api' }: { name?: EndpointSlot }) {
  const { endpoints } = useProgress()
  const own = endpoints[name]
  return (
    <code
      data-own={own ? '' : undefined}
      className="rounded border bg-surface px-1.5 py-0.5 font-mono text-[0.8125em] text-foreground"
    >
      {own ?? EXAMPLE_ENDPOINTS[name]}
    </code>
  )
}
