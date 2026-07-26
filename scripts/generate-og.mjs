/**
 * Renders one Open Graph card per route into `public/og/**.png`.
 *
 *   node scripts/generate-og.mjs            # generate (run BEFORE next build)
 *   node scripts/generate-og.mjs --verify   # check coverage (run AFTER)
 *
 * Cards go to `public/` rather than `out/` so Next copies them through its own
 * asset pipeline. Writing into `out/` after the build also works for the S3
 * sync, but Vercel serves only what Next itself emits and silently drops
 * anything added afterwards.
 *
 * Next's `opengraph-image` file convention cannot be used at all here: it is
 * rejected under a catch-all segment ("Catch-all must be the last part of the
 * URL"), and the workshop is a catch-all route. Static PNGs also survive the
 * move to S3, where no image route handler exists.
 *
 * Because generation runs before the build, routes are derived from the content
 * tree rather than the emitted HTML — so `--verify` re-checks them against the
 * real build output afterwards and fails on any route without a card.
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import React from 'react'
import matter from 'gray-matter'
// Deep path: the bare "next/og" specifier is not resolvable outside the bundler.
import { ImageResponse } from 'next/og.js'

const VERIFY = process.argv.includes('--verify')
const PUBLIC_OG = path.resolve('public/og')
const OUT = path.resolve('out')

const SIZE = { width: 1200, height: 630 }

// Mirrors globals.css: --background, --brand, --foreground, --muted-foreground.
const COLORS = { bg: '#191722', brand: '#a78bfa', fg: '#f4f3f6', muted: '#9d99ab' }

/** Must match `stripOrder` in lib/workshops.ts — `100-awscli` -> `awscli`. */
const stripOrder = (name) => name.replace(/^\d+-/, '')
const orderOf = (name) => Number(/^(\d+)-/.exec(name)?.[1] ?? 9999)

/** Route path -> the PNG key used by `ogImage()` in lib/site.ts. */
const keyFor = (route) => route.replace(/^\/+|\/+$/g, '') || 'index'

const el = React.createElement

function card({ title, label }) {
  return el(
    'div',
    {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 80,
        background: COLORS.bg,
        color: COLORS.fg,
      },
    },
    el(
      'div',
      { style: { display: 'flex', fontSize: 30, color: COLORS.brand, letterSpacing: 2 } },
      label.toUpperCase(),
    ),
    el(
      'div',
      {
        style: {
          display: 'flex',
          fontSize: title.length > 60 ? 56 : 72,
          lineHeight: 1.15,
          // ImageResponse has no text-wrap balancing; cap the box instead.
          maxHeight: 320,
          overflow: 'hidden',
        },
      },
      title,
    ),
    el('div', { style: { display: 'flex', fontSize: 28, color: COLORS.muted } }, 'terraconstructs.dev'),
  )
}

async function titleOf(file, fallback) {
  try {
    const { data } = matter(await fs.readFile(file, 'utf8'))
    return String(data.title ?? fallback)
  } catch {
    return fallback
  }
}

/** Walks content/workshops/<locale>/<workshop> the same way lib/workshops.ts does. */
async function workshopRoutes(dir, segments) {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => [])
  const routes = []

  for (const entry of entries.sort(
    (a, b) => orderOf(a.name) - orderOf(b.name) || a.name.localeCompare(b.name),
  )) {
    if (entry.isDirectory()) {
      const child = [...segments, stripOrder(entry.name)]
      routes.push({
        route: `/workshops/${child.join('/')}`,
        title: await titleOf(path.join(dir, entry.name, 'index.mdx'), child.at(-1)),
        label: 'Workshop',
      })
      routes.push(...(await workshopRoutes(path.join(dir, entry.name), child)))
    } else if (entry.name.endsWith('.mdx') && entry.name !== 'index.mdx') {
      const slug = stripOrder(entry.name.replace(/\.mdx$/, ''))
      routes.push({
        route: `/workshops/${[...segments, slug].join('/')}`,
        title: await titleOf(path.join(dir, entry.name), slug),
        label: 'Workshop',
      })
    }
  }
  return routes
}

async function collectRoutes() {
  const routes = [
    { route: '/', title: 'Infrastructure as actual code', label: 'TerraConstructs' },
    { route: '/blog', title: 'Blog', label: 'TerraConstructs' },
    { route: '/workshops', title: 'Learn TerraConstructs by building', label: 'TerraConstructs' },
  ]

  const blogDir = path.resolve('content/blog')
  for (const name of (await fs.readdir(blogDir).catch(() => [])).sort()) {
    if (!name.endsWith('.mdx')) continue
    const slug = name.replace(/\.mdx$/, '')
    routes.push({
      route: `/blog/${slug}`,
      title: await titleOf(path.join(blogDir, name), slug),
      label: 'Blog',
    })
  }

  const workshopsRoot = path.resolve('content/workshops/en')
  for (const workshop of (await fs.readdir(workshopsRoot).catch(() => [])).sort()) {
    routes.push({
      route: `/workshops/${workshop}`,
      title: await titleOf(path.join(workshopsRoot, workshop, 'index.mdx'), workshop),
      label: 'Workshop',
    })
    routes.push(...(await workshopRoutes(path.join(workshopsRoot, workshop), [workshop])))
  }

  return routes
}

// ---------------------------------------------------------------------------

if (VERIFY) {
  /** Every route the build actually emitted. */
  async function emitted(dir, rel = '') {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    const routes = []
    for (const entry of entries) {
      if (entry.name === 'og' || entry.name === '_next') continue
      const childRel = rel ? `${rel}/${entry.name}` : entry.name
      if (entry.isDirectory()) routes.push(...(await emitted(path.join(dir, entry.name), childRel)))
      else if (entry.name === 'index.html') routes.push(`/${rel}`)
    }
    return routes
  }

  const built = await fs.stat(OUT).then(() => true).catch(() => false)
  if (!built) {
    console.error('No build output at out/ — run `next build` first.')
    process.exit(1)
  }

  const missing = []
  for (const route of await emitted(OUT)) {
    if (route.includes('_not-found') || route.startsWith('/404')) continue
    const png = path.join(OUT, 'og', `${keyFor(route)}.png`)
    if (!(await fs.stat(png).then(() => true).catch(() => false))) missing.push(route)
  }

  if (missing.length) {
    console.error(
      `Missing Open Graph cards for ${missing.length} route(s):\n` +
        missing.map((r) => `  ${r}`).join('\n') +
        '\nThe route derivation in this script has drifted from the app.',
    )
    process.exit(1)
  }
  console.log(`Open Graph cards verified for every emitted route.`)
} else {
  await fs.rm(PUBLIC_OG, { recursive: true, force: true })

  const routes = await collectRoutes()
  for (const { route, title, label } of routes) {
    const dest = path.join(PUBLIC_OG, `${keyFor(route)}.png`)
    const image = new ImageResponse(card({ title, label }), SIZE)
    await fs.mkdir(path.dirname(dest), { recursive: true })
    await fs.writeFile(dest, Buffer.from(await image.arrayBuffer()))
  }

  console.log(`Generated ${routes.length} Open Graph cards into public/og/`)
}
