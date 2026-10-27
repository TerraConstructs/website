'use client'

import { useEffect, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Copies the fence's source string rather than the rendered DOM text, so line
 * numbers and highlight markup can never leak into the clipboard.
 */
export function CopyButton({ code, className }: { code: string; className?: string }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 1500)
    return () => clearTimeout(t)
  }, [copied])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
    } catch {
      // clipboard is unavailable on insecure origins; nothing useful to show
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? 'Copied' : 'Copy code'}
      title={copied ? 'Copied' : 'Copy code'}
      className={cn(
        'inline-flex size-7 items-center justify-center rounded-md border bg-surface text-muted-foreground transition',
        'hover:text-foreground focus-visible:outline-2 focus-visible:outline-brand',
        // hidden until the block is hovered or focused; always shown where there is no hover
        'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100',
        className,
      )}
    >
      {copied ? <Check className="size-3.5 text-brand" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
      <span className="sr-only" aria-live="polite">
        {copied ? 'Copied to clipboard' : ''}
      </span>
    </button>
  )
}
