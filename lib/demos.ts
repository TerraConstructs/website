import { readFile, readdir } from 'node:fs/promises'
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
    langs: ['typescript', 'hcl', 'json', 'bash', 'diff', 'yaml'],
  })
  return globalCache[HIGHLIGHTER_KEY]
}

const SUPPORTED_LANGS = new Set(['typescript', 'ts', 'hcl', 'tf', 'json', 'bash', 'sh', 'shell', 'diff', 'yaml', 'yml'])
const LANG_ALIAS: Record<string, string> = { ts: 'typescript', tf: 'hcl', sh: 'bash', shell: 'bash', yml: 'yaml' }

/** Shiki-highlighted HTML for MDX fenced code blocks. */
export async function highlightToHtml(code: string, lang: string): Promise<string> {
  const highlighter = await getHighlighter()
  const resolved = SUPPORTED_LANGS.has(lang) ? (LANG_ALIAS[lang] ?? lang) : 'text'
  return highlighter.codeToHtml(code, {
    lang: resolved,
    themes: { light: 'github-light', dark: 'vitesse-dark' },
    defaultColor: false,
    colorReplacements: { '#ffffff': 'transparent', '#121212': 'transparent' },
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
  const ids = entries.filter((e) => e.isDirectory()).map((e) => e.name)

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
