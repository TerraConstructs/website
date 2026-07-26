'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from './logo'
import { ThemeToggle } from './theme-toggle'
import { LINKS } from '@/lib/links'

const NAV = [
  { label: 'Why objects', href: '/#documents-vs-objects' },
  { label: 'Guided tour', href: '/#guided-tour' },
  { label: 'Capabilities', href: '/#capabilities' },
  { label: 'Blog', href: '/blog' },
]

const EXTERNAL = [
  { label: 'Docs', href: LINKS.docs },
  { label: 'Workshop', href: LINKS.workshop },
  { label: 'GitHub', href: LINKS.github },
]

export function SiteNav() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b transition-colors duration-300',
        scrolled ? 'border-border bg-background/85 backdrop-blur-md' : 'border-transparent',
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Logo />

        <nav aria-label="Sections" className="ml-4 hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <nav aria-label="External" className="hidden items-center gap-1 md:flex">
            {EXTERNAL.map((item) => (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-0.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
                <ArrowUpRight className="size-3 opacity-50" />
              </a>
            ))}
          </nav>
          <ThemeToggle />
          <a
            href={LINKS.cdkDev}
            target="_blank"
            rel="noreferrer"
            className="ml-1 hidden rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-brand-foreground transition-opacity hover:opacity-90 sm:block"
          >
            Join cdk.dev
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Toggle menu"
            className="flex size-8 items-center justify-center rounded-md border text-muted-foreground lg:hidden"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t bg-background lg:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col px-4 py-2 sm:px-6">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="py-2 text-sm text-muted-foreground"
              >
                {item.label}
              </Link>
            ))}
            <div className="my-2 h-px bg-border" />
            {EXTERNAL.concat([{ label: 'cdk.dev community', href: LINKS.cdkDev }]).map((item) => (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 py-2 text-sm text-muted-foreground"
              >
                {item.label}
                <ArrowUpRight className="size-3 opacity-50" />
              </a>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  )
}
