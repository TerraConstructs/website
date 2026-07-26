export const SITE_URL = 'https://terraconstructs.dev'
export const SITE_NAME = 'TerraConstructs'

/** Google Analytics 4, carried over from the previous site for continuity. */
export const GA_MEASUREMENT_ID = 'G-202ZG9CZKL'

/**
 * Social card for a route. Images are rendered into `out/og/**` after the Next
 * build by scripts/generate-og.mjs, keyed on the route path:
 *   `/`                    -> /og/index.png
 *   `/workshops/aws/`      -> /og/workshops/aws.png
 */
export function ogImage(pathname: string) {
  const clean = pathname.replace(/^\/+|\/+$/g, '')
  return `/og/${clean || 'index'}.png`
}
