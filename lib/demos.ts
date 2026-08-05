import { access, readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { cache } from 'react'
import { getSingletonHighlighter, type Highlighter } from 'shiki'

/**
 * Guided tour demos are "pre-compiled": each folder under /demos holds the real
 * TypeScript input of a TerraConstructs app, the real synthesized HCL output,
 * and a tour.json describing the step-through highlights.
 *
 * Adding a demo = adding a folder. No code changes required:
 *   demos/<id>/input.ts    <- the construct program
 *   demos/<id>/output.tf   <- `cdktn synth` output, converted to HCL
 *   demos/<id>/tour.json   <- { name, description, fileName, tour: {...} }
 */

export type TourStep = {
  id: string
  type: 'line-range'
  startLine: number
  endLine: number
  title: string
  content: string
  highlight?: 'border' | 'background'
}

export type TourMeta = {
  name: string
  description: string
  fileName: string
  outputFileName: string
  tour: { inputSteps: TourStep[]; outputSteps: TourStep[] }
}

/** A token is [text, paletteIndex] to keep the serialized payload small. */
export type Token = [string, number]
export type CodePane = {
  lang: string
  label: string
  lineCount: number
  lines: Token[][]
  /** palette[i] = [lightColor, darkColor] */
  palette: [string, string][]
}

export type Demo = TourMeta & {
  id: string
  input: CodePane
  output: CodePane
}

const DEMOS_DIR = path.join(process.cwd(), 'demos')

/**
 * Shiki's own singleton, kept on `globalThis` so dev-mode HMR module
 * re-evaluation reuses one instance (and one WASM engine) instead of leaking a
 * new highlighter per reload. React's `cache` is per-request and would not help.
 */
const HIGHLIGHTER_KEY = Symbol.for('terraconstructs.shiki')
const globalCache = globalThis as { [HIGHLIGHTER_KEY]?: Promise<Highlighter> }

function getHighlighter(): Promise<Highlighter> {
  globalCache[HIGHLIGHTER_KEY] ??= getSingletonHighlighter({
    themes: ['github-light', 'vitesse-dark'],
    langs: ['typescript', 'javascript', 'hcl', 'json', 'bash', 'diff', 'yaml'],
  })
  return globalCache[HIGHLIGHTER_KEY]
}

/**
 * Every fence language a post may use. An unlisted one silently degrades to
 * plain text — the block still renders, just without tokens — so anything added
 * here must also be loaded as a grammar in `getHighlighter` above.
 */
const SUPPORTED_LANGS = new Set([
  'typescript',
  'ts',
  'javascript',
  'js',
  'mjs',
  'cjs',
  'hcl',
  'tf',
  'json',
  'bash',
  'sh',
  'shell',
  'terminal',
  'diff',
  'yaml',
  'yml',
])
const LANG_ALIAS: Record<string, string> = {
  ts: 'typescript',
  js: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  tf: 'hcl',
  sh: 'bash',
  shell: 'bash',
  terminal: 'bash', // a Hugo-era label that survived the workshop conversion
  yml: 'yaml',
}

/**
 * Parses a fence meta string like `{3,5-7}` into the set of 1-based line
 * numbers to emphasise. This is the workshop's replacement for Hugo's
 * `{{<highlight ts "hl_lines=3 5-7">}}`.
 */
export function parseHighlightLines(meta?: string): Set<number> {
  const lines = new Set<number>()
  const inner = /\{([\d,\s-]+)\}/.exec(meta ?? '')?.[1]
  if (!inner) return lines

  for (const part of inner.split(',')) {
    const range = /^\s*(\d+)\s*-\s*(\d+)\s*$/.exec(part)
    if (range) {
      for (let i = Number(range[1]); i <= Number(range[2]); i++) lines.add(i)
    } else if (part.trim()) {
      lines.add(Number(part.trim()))
    }
  }
  return lines
}

/** Shiki-highlighted HTML for MDX fenced code blocks. */
export async function highlightToHtml(
  code: string,
  lang: string,
  highlightLines?: Set<number>,
): Promise<string> {
  const highlighter = await getHighlighter()
  const resolved = SUPPORTED_LANGS.has(lang) ? (LANG_ALIAS[lang] ?? lang) : 'text'

  // The highlighter is cached on globalThis, so in dev an HMR reload reuses an
  // instance built before a grammar was added to the eager list above — it
  // would throw "Language not found" until the server restarts. Load on demand
  // instead, which also means the two lists can drift without breaking a page.
  if (resolved !== 'text' && !highlighter.getLoadedLanguages().includes(resolved)) {
    await highlighter.loadLanguage(resolved as Parameters<typeof highlighter.loadLanguage>[0])
  }

  return highlighter.codeToHtml(code, {
    lang: resolved,
    themes: { light: 'github-light', dark: 'vitesse-dark' },
    defaultColor: false,
    colorReplacements: { '#ffffff': 'transparent', '#121212': 'transparent' },
    transformers:
      highlightLines?.size
        ? [
            {
              // marks emphasised lines; `.line.hl` is styled in globals.css
              line(node, line) {
                if (highlightLines.has(line)) this.addClassToHast(node, 'hl')
              },
            },
          ]
        : [],
  })
}

async function highlight(code: string, lang: string, label: string): Promise<CodePane> {
  const highlighter = await getHighlighter()
  const { tokens } = highlighter.codeToTokens(code.replace(/\s+$/, ''), {
    lang: lang as 'typescript',
    themes: { light: 'github-light', dark: 'vitesse-dark' },
    defaultColor: false,
  })

  const palette: [string, string][] = []
  const index = new Map<string, number>()

  const lines: Token[][] = tokens.map((line) =>
    line.map((token) => {
      const style = (token.htmlStyle ?? {}) as Record<string, string>
      const light = style['--shiki-light'] ?? 'inherit'
      const dark = style['--shiki-dark'] ?? 'inherit'
      const key = `${light}|${dark}`
      let i = index.get(key)
      if (i === undefined) {
        i = palette.length
        palette.push([light, dark])
        index.set(key, i)
      }
      return [token.content, i] as Token
    }),
  )

  return { lang, label, lineCount: lines.length, lines, palette }
}

export const getDemos = cache(async (): Promise<Demo[]> => {
  const entries = await readdir(DEMOS_DIR, { withFileTypes: true })

  // A directory is a demo only if it carries a tour.json. Other folders do turn
  // up here — an experiment that left a node_modules behind is enough — and
  // treating them as demos took down the whole landing page, in dev and build
  // alike, from a file nobody had committed.
  const ids: string[] = []
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    try {
      await access(path.join(DEMOS_DIR, entry.name, 'tour.json'))
      ids.push(entry.name)
    } catch {
      continue
    }
  }

  const demos = await Promise.all(
    ids.map(async (id) => {
      const dir = path.join(DEMOS_DIR, id)
      const [meta, ts, tf] = await Promise.all([
        readFile(path.join(dir, 'tour.json'), 'utf8').then((s) => JSON.parse(s) as TourMeta),
        readFile(path.join(dir, 'input.ts'), 'utf8'),
        readFile(path.join(dir, 'output.tf'), 'utf8'),
      ])
      const [input, output] = await Promise.all([
        highlight(ts, 'typescript', meta.fileName),
        highlight(tf, 'hcl', meta.outputFileName),
      ])
      return { id, ...meta, input, output }
    }),
  )

  return demos.sort((a, b) => a.name.localeCompare(b.name))
})
