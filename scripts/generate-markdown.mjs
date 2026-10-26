/**
 * Emits a Markdown twin of every exported page, plus /llms.txt.
 *
 *   node scripts/generate-markdown.mjs      # run AFTER next build
 *
 *   out/blog/documents-vs-objects/index.html -> out/blog/documents-vs-objects/index.md
 *
 * The CloudFront viewer-request function serves these at the page's own URL
 * when a client sends `Accept: text/markdown`, and the viewer-response function
 * advertises them with a `Link: <…/index.md>; rel="alternate"` header.
 *
 * Converted from the built HTML rather than the MDX sources so every route —
 * the landing page included — gets one, and so MDX components render to what a
 * reader actually sees. Only `<main id="main">` is converted: the site header,
 * nav and footer would be the same noise on every page.
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { unified } from 'unified'
import rehypeParse from 'rehype-parse'
import rehypeRemark from 'rehype-remark'
import remarkGfm from 'remark-gfm'
import remarkStringify from 'remark-stringify'
import { select, selectAll } from 'hast-util-select'
import { remove } from 'unist-util-remove'

const OUT = path.resolve('out')
const SITE_URL = 'https://terraconstructs.dev'

/** Chrome that carries no content once flattened to text. */
const DROP = 'script, style, noscript, template, svg, button, [aria-hidden="true"], [hidden]'

async function* pages(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (['_next', '_not-found', '404'].includes(entry.name)) continue
      yield* pages(full)
    } else if (entry.name === 'index.html') {
      yield full
    }
  }
}

const parse = unified().use(rehypeParse)
const toMarkdown = unified()
  .use(rehypeRemark)
  .use(remarkGfm)
  .use(remarkStringify, { bullet: '-', fences: true, rule: '-' })

function meta(tree, name) {
  const node =
    select(`meta[name="${name}"]`, tree) ?? select(`meta[property="og:${name}"]`, tree)
  return node?.properties?.content ?? ''
}

async function convert(file) {
  const html = await fs.readFile(file, 'utf8')
  const tree = parse.parse(html)
  const main = select('main#main', tree) ?? select('main', tree)
  if (!main) throw new Error(`${path.relative(OUT, file)}: no <main> element`)

  const dropped = new Set(selectAll(DROP, main))
  // `comment` drops React's `<!-- -->` text-node separators.
  remove(main, (node) => node.type === 'comment' || dropped.has(node))

  const route = '/' + path.relative(OUT, path.dirname(file)).split(path.sep).join('/')
  const url = SITE_URL + (route === '/' ? '/' : `${route}/`)
  // Page titles carry a ` — Section · TerraConstructs` suffix; llms.txt groups
  // by section already, so keep only the page's own name.
  const title = (select('title', tree)?.children?.[0]?.value ?? '').split(' — ')[0]
  const description = meta(tree, 'description')

  const root = { type: 'root', children: [main] }
  const mdast = await toMarkdown.run(root)
  const body = toMarkdown.stringify(mdast).trim()

  // Provenance first, so an agent quoting the page can cite the canonical URL.
  const header = [`Source: ${url}`, description && `> ${description}`]
    .filter(Boolean)
    .join('\n\n')
  await fs.writeFile(file.replace(/\.html$/, '.md'), `${header}\n\n${body}\n`)
  return { route, url, title, description }
}

const converted = []
for await (const file of pages(OUT)) converted.push(await convert(file))
converted.sort((a, b) => a.route.localeCompare(b.route))

/** llms.txt (https://llmstxt.org): H1, blockquote summary, then link sections. */
const section = (heading, entries) =>
  entries.length
    ? [
        `## ${heading}`,
        '',
        ...entries.map(
          (p) =>
            `- [${p.title}](${p.url}index.md)${p.description ? `: ${p.description}` : ''}`,
        ),
        '',
      ]
    : []
const home = converted.find((p) => p.route === '/')
const isUnder = (prefix) => (p) => p.route.startsWith(prefix)
const llms = [
  '# TerraConstructs',
  '',
  `> ${home?.description ?? ''}`,
  '',
  'Every page on this site is also served as Markdown: request it with',
  '`Accept: text/markdown`, or append `index.md` to its URL.',
  '',
  'This site is documentation and writing only. It exposes no API, OpenAPI',
  'document, authentication flow or MCP server.',
  '',
  ...section('Pages', converted.filter((p) => !isUnder('/blog/')(p) && !isUnder('/workshops/')(p))),
  ...section('Blog', converted.filter(isUnder('/blog/'))),
  ...section('Workshops', converted.filter(isUnder('/workshops/'))),
  '## Optional',
  '',
  `- [Sitemap](${SITE_URL}/sitemap.xml): Every human-readable page.`,
  '',
].join('\n')
await fs.writeFile(path.join(OUT, 'llms.txt'), llms)

console.log(`markdown: ${converted.length} pages + llms.txt`)
