import { highlightToHtml, parseHighlightLines } from '@/lib/demos'

/**
 * Server-rendered Shiki code block. Shares the highlighter singleton with the
 * guided tour so posts and the tour stay visually consistent.
 *
 * `meta` is the fence's trailing meta string (e.g. `{3,5-7}`), used by workshop
 * pages to emphasise the lines a step just changed.
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
  const html = await highlightToHtml(code, lang, parseHighlightLines(meta))

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
    </figure>
  )
}
