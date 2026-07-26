'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import type { Heading } from '@/lib/blog'

export function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeSlug, setActiveSlug] = useState<string | null>(headings[0]?.slug ?? null)
  // Suppresses observer updates while a click-triggered smooth scroll is in flight.
  const lockRef = useRef(false)

  useEffect(() => {
    if (headings.length === 0) return

    const elements = headings
      .map((h) => document.getElementById(h.slug))
      .filter((el): el is HTMLElement => el !== null)

    if (elements.length === 0) return

    const pickActive = () => {
      if (lockRef.current) return

      // The heading whose top is closest to (but still above) the reading line.
      const readingLine = 140
      let current = elements[0]

      for (const el of elements) {
        if (el.getBoundingClientRect().top <= readingLine) current = el
        else break
      }

      // At the very bottom of the page, favour the last heading so the final
      // section can always become active even if it is shorter than the viewport.
      const atBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 80
      if (atBottom) current = elements[elements.length - 1]

      setActiveSlug(current.id)
    }

    pickActive()
    window.addEventListener('scroll', pickActive, { passive: true })
    window.addEventListener('resize', pickActive)
    return () => {
      window.removeEventListener('scroll', pickActive)
      window.removeEventListener('resize', pickActive)
    }
  }, [headings])

  if (headings.length === 0) return null

  const onClick = (e: React.MouseEvent<HTMLAnchorElement>, slug: string) => {
    e.preventDefault()
    const el = document.getElementById(slug)
    if (!el) return

    lockRef.current = true
    setActiveSlug(slug)
    history.replaceState(null, '', `#${slug}`)
    el.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
    })
    window.setTimeout(() => {
      lockRef.current = false
    }, 700)
  }

  return (
    <nav aria-label="On this page" className="text-sm">
      <span className="label-mono">On this page</span>
      <ul className="mt-4 border-l">
        {headings.map((h) => {
          const active = h.slug === activeSlug
          return (
            <li key={h.slug}>
              <a
                href={`#${h.slug}`}
                onClick={(e) => onClick(e, h.slug)}
                aria-current={active ? 'location' : undefined}
                className={cn(
                  '-ml-px block border-l py-1.5 pr-2 text-pretty leading-snug transition-colors',
                  h.depth === 3 ? 'pl-6 text-[0.8125rem]' : 'pl-4',
                  active
                    ? 'border-brand font-medium text-foreground'
                    : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground',
                )}
              >
                {h.text}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
