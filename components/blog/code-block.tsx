import { highlightToHtml, parseHighlightLines } from '@/lib/demos'
import { expandEndpointPlaceholders } from '@/lib/progress/model'
import { EndpointFill } from '@/components/workshop/progress/endpoint-fill'
import { cn } from '@/lib/utils'
import { CopyButton } from './copy-button'

// Shell sessions and plain output are read as commands, not as a listing to
// cross-reference, so a gutter there is noise.
const NO_LINE_NUMBER_LANGS = new Set([
  'bash',
  'sh',
  'shell',
  'terminal',
  'console',
  'text',
  'plaintext',
  'txt',
  'tfplan',
])

/**
 * Server-rendered Shiki code block, sharing the guided tour's highlighter.
 * `meta` is the fence's meta string (e.g. `{3,5-7}`): lines to emphasise.
 * `lineNumbers` is opt-in and skipped for one-liners and shell blocks.
 * `<Endpoint />` renders as the example endpoint until `EndpointFill` swaps in the attendee's.
 */
export async function CodeBlock({
  code,
  lang = 'text',
  filename,
  meta,
  lineNumbers = false,
}: {
  code: string
  lang?: string
  filename?: string
  meta?: string
  lineNumbers?: boolean
}) {
  const expanded = expandEndpointPlaceholders(code)
  const html = await highlightToHtml(
    expanded.code,
    lang,
    parseHighlightLines(meta),
    expanded.ranges.map((r) => ({
      start: r.start,
      end: r.end,
      properties: { 'data-endpoint': r.slot, class: 'tc-endpoint' },
    })),
  )
  const lineCount = expanded.code.split('\n').length
  const numbered = lineNumbers && lineCount > 1 && !NO_LINE_NUMBER_LANGS.has(lang)

  return (
    <figure className="group relative mt-6 overflow-hidden rounded-lg border bg-surface">
      {filename ? (
        <figcaption className="flex items-center gap-2 border-b bg-background/40 py-1 pl-3 pr-1">
          <span className="size-1.5 rounded-full bg-brand" aria-hidden />
          <span className="font-mono text-[0.6875rem] text-muted-foreground">{filename}</span>
          <CopyButton code={expanded.code} className="ml-auto" />
        </figcaption>
      ) : (
        <CopyButton code={expanded.code} className="absolute right-2 top-2 z-10" />
      )}
      <div
        className={cn(
          'overflow-x-auto p-4 font-mono text-[0.8125rem] leading-relaxed [&_pre]:bg-transparent',
          numbered && 'line-numbers',
        )}
        // gutter wide enough for the longest line number
        style={numbered ? { '--ln-width': `${String(lineCount).length}ch` } as React.CSSProperties : undefined}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {expanded.ranges.length ? <EndpointFill /> : null}
    </figure>
  )
}
