/**
 * Renders one Open Graph card per route into `out/og/**.png`.
 *
 *   node scripts/generate-og.mjs [--out out]
 *
 * Runs AFTER `next build` and walks the emitted HTML rather than the content
 * tree, so the set of cards is exactly the set of real routes and the titles are
 * exactly what the pages render — neither can drift from the other.
 *
 * Next's `opengraph-image` file convention cannot be used here: it is rejected
 * under a catch-all segment ("Catch-all must be the last part of the URL"), and
 * the workshop is a catch-all route. Generating static files also keeps the
 * cards working under `output: 'export'`, where no image route handler exists.
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import React from 'react'
// Deep path: the bare "next/og" specifier is not resolvable outside the bundler.
import { ImageResponse } from 'next/og.js'

const args = process.argv.slice(2)
const outFlag = args.indexOf('--out')
const OUT = path.resolve(outFlag !== -1 ? args[outFlag + 1] : 'out')

const SIZE = { width: 1200, height: 630 }

// Mirrors globals.css: --background, --brand, --foreground, --muted-foreground.
const COLORS = {
  bg: '#191722',
  brand: '#a78bfa',
  fg: '#f4f3f6',
  muted: '#9d99ab',
}

/** Route path -> the eyebrow label shown above the title. */
function labelFor(route) {
  if (route.startsWith('/workshops')) return 'Workshop'
  if (route.startsWith('/blog')) return 'Blog'
  return 'TerraConstructs'
}

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
          // ImageResponse has no text-wrap balancing; cap length instead.
          maxHeight: 300,
          overflow: 'hidden',
        },
      },
      title,
    ),
    el(
      'div',
      { style: { display: 'flex', fontSize: 28, color: COLORS.muted } },
      'terraconstructs.dev',
    ),
  )
}

/** Every `index.html` under out/, as a route path. */
async function findRoutes(dir, rel = '') {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const routes = []
  for (const entry of entries) {
    if (entry.name === 'og' || entry.name === '_next') continue
    const childRel = rel ? `${rel}/${entry.name}` : entry.name
    if (entry.isDirectory()) {
      routes.push(...(await findRoutes(path.join(dir, entry.name), childRel)))
    } else if (entry.name === 'index.html') {
      routes.push({ route: `/${rel}`, file: path.join(dir, entry.name) })
    }
  }
  return routes
}

const TITLE_RE = /<title[^>]*>([\s\S]*?)<\/title>/i

function decode(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
}

const exists = await fs.stat(OUT).then(() => true).catch(() => false)
if (!exists) {
  console.error(`No build output at ${path.relative(process.cwd(), OUT)} — run \`next build\` first.`)
  process.exit(1)
}

const routes = await findRoutes(OUT)
let written = 0

for (const { route, file } of routes) {
  // 404 and Next's internal not-found route get no social card.
  if (route.includes('_not-found') || route.startsWith('/404')) continue

  const html = await fs.readFile(file, 'utf8')
  const raw = TITLE_RE.exec(html)?.[1] ?? ''
  // Titles carry a " · TerraConstructs" suffix from the metadata template.
  const title = decode(raw).split(/\s+[·|—]\s+/)[0].trim() || 'TerraConstructs'

  const key = route.replace(/^\/+|\/+$/g, '') || 'index'
  const dest = path.join(OUT, 'og', `${key}.png`)

  const image = new ImageResponse(card({ title, label: labelFor(route) }), SIZE)
  const buffer = Buffer.from(await image.arrayBuffer())

  await fs.mkdir(path.dirname(dest), { recursive: true })
  await fs.writeFile(dest, buffer)
  written++
}

console.log(`Generated ${written} Open Graph cards into ${path.relative(process.cwd(), path.join(OUT, 'og'))}/`)
