type HastNode = {
  type: string
  tagName?: string
  data?: { meta?: string }
  properties?: Record<string, unknown>
  children?: HastNode[]
}

/**
 * Copies a fence's meta string onto the `<code>` element's properties so it
 * survives into MDX props.
 *
 * Markdown puts everything after the language on `node.data.meta` (for
 * ```` ```ts {3,5-7} ```` that is `{3,5-7}`), which the default hast -> JSX
 * conversion drops. Without this, the code-block component has no way to know
 * which lines to emphasise.
 */
export function rehypeCodeMeta() {
  return (tree: HastNode) => {
    const walk = (node: HastNode) => {
      if (node.type === 'element' && node.tagName === 'code' && node.data?.meta) {
        node.properties = { ...node.properties, meta: node.data.meta }
      }
      node.children?.forEach(walk)
    }
    walk(tree)
  }
}
