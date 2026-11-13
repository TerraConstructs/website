import { highlightToHtml, parseHighlightLines } from '@/lib/demos'
import { expandEndpointPlaceholders } from '@/lib/progress/model'
import { EndpointFill } from '@/components/workshop/progress/endpoint-fill'

/**
 * Server-rendered Shiki code block, sharing the guided tour's highlighter.
 * `meta` is the fence's meta string (e.g. `{3,5-7}`): lines to emphasise.
 * `<Endpoint />` in a fence renders as the documented example endpoint, and
 * `EndpointFill` swaps in the attendee's own once they posted it.
 */
export async function CodeBlock({
  code,
  lang = 'text',
  filename,
  meta,
}: {
  code: string
  lang?: string
  filename?: string
  meta?: string
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

  return (
    <figure className="mt-6 overflow-hidden rounded-lg border bg-surface">
      {filename ? (
        <figcaption className="flex items-center gap-2 border-b bg-background/40 px-3 py-2">
          <span className="size-1.5 rounded-full bg-brand" aria-hidden />
          <span className="font-mono text-[0.6875rem] text-muted-foreground">{filename}</span>
        </figcaption>
      ) : null}
      <div
        className="overflow-x-auto p-4 font-mono text-[0.8125rem] leading-relaxed [&_pre]:bg-transparent"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {expanded.ranges.length ? <EndpointFill /> : null}
    </figure>
  )
}
