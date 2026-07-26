/**
 * Side-by-side "document vs object" comparison.
 *
 * Takes two fenced code blocks as children so posts never need multi-line
 * template-literal props (MDX drops those):
 *
 *   <SplitCompare leftLabel="HCL" rightLabel="TerraConstructs" caption="…">
 *
 *   ```hcl
 *   …
 *   ```
 *
 *   ```typescript
 *   …
 *   ```
 *
 *   </SplitCompare>
 */
export function SplitCompare({
  leftLabel = 'Document',
  rightLabel = 'Object',
  caption,
  children,
}: {
  leftLabel?: string
  rightLabel?: string
  caption?: string
  children: React.ReactNode
}) {
  return (
    <div className="mt-6">
      <div className="grid gap-x-3 md:grid-cols-2">
        <span className="label-mono text-doc">{leftLabel}</span>
        <span className="label-mono mt-4 text-brand md:mt-0">{rightLabel}</span>
      </div>
      <div className="mt-2 grid items-start gap-3 md:grid-cols-2 [&>figure]:mt-0">
        {children}
      </div>
      {caption ? (
        <p className="mt-3 text-pretty text-sm text-muted-foreground">{caption}</p>
      ) : null}
    </div>
  )
}
