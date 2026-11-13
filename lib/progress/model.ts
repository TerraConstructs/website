/**
 * Workshop progress without React or network: segment states, the endpoint
 * placeholder, and the Worker's reason codes. The Worker (box-poc-workshop)
 * owns the truth: checks come from content generated out of this repo's
 * frontmatter, and it returns only a verdict.
 */

/** Segment colours: green = verified, yellow = unverified, blue = done, empty = not reached. */
export type StepState = 'verified' | 'unverified' | 'done'
export type SegmentState = StepState | 'empty'

export type EndpointSlot = 'api' | 'viewer'
export const ENDPOINT_SLOTS: readonly EndpointSlot[] = ['api', 'viewer']

/** What a page's frontmatter says about progress (`progress:` block). */
export type PageProgress = {
  /** This page asks for the attendee's endpoint. */
  capture: EndpointSlot | null
  /** This page has a check the Worker runs on "next". */
  verifies: boolean
}

export type ProgressStep = { id: string; title: string; href: string }

/** The documented example values the pages show until the attendee posts their own. */
export const EXAMPLE_ENDPOINTS: Record<EndpointSlot, string> = {
  api: 'https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/',
  viewer: 'https://yyyyyyyyyy.execute-api.us-east-1.amazonaws.com/prod/',
}

/**
 * The placeholder inside fenced code: `<Endpoint />` or `<Endpoint name="viewer" />`.
 * Written like the MDX component so the source reads the same in prose and in a fence.
 */
const PLACEHOLDER = /<Endpoint(?:\s+name=["'](api|viewer)["'])?\s*\/>/g

export type EndpointRange = { start: number; end: number; slot: EndpointSlot }

/**
 * Replaces each placeholder with the example endpoint and reports where it
 * landed, so the highlighter can wrap exactly those characters for the client
 * to swap. A path written after the placeholder (`<Endpoint />hello`) is kept.
 */
export function expandEndpointPlaceholders(code: string): { code: string; ranges: EndpointRange[] } {
  const ranges: EndpointRange[] = []
  let out = ''
  let last = 0
  for (const m of code.matchAll(PLACEHOLDER)) {
    const slot = (m[1] ?? 'api') as EndpointSlot
    out += code.slice(last, m.index)
    const start = out.length
    out += EXAMPLE_ENDPOINTS[slot]
    ranges.push({ start, end: out.length, slot })
    last = m.index! + m[0].length
  }
  out += code.slice(last)
  return { code: out, ranges }
}

/** State per page, in reading order, for the progress bar. */
export function segmentStates(
  steps: ProgressStep[],
  recorded: Record<string, { state: StepState } | undefined>,
): SegmentState[] {
  return steps.map((s) => recorded[s.id]?.state ?? 'empty')
}

export function summarize(states: SegmentState[]) {
  const count = (s: SegmentState) => states.filter((x) => x === s).length
  return {
    verified: count('verified'),
    unverified: count('unverified'),
    done: count('done'),
    reached: states.length - count('empty'),
    total: states.length,
  }
}

export const STATE_LABEL: Record<SegmentState, string> = {
  verified: 'verified',
  unverified: 'not verified',
  done: 'done',
  empty: 'not reached',
}

/** What the reader is told after "next" on a page with a check. Short, never alarming. */
export function verdictMessage(state: StepState, reason: string): string {
  if (state === 'verified') return 'Verified: your endpoint answered as this page expects.'
  switch (reason) {
    case 'no_endpoint':
      return 'Not verified: no endpoint saved yet. Moving on.'
    case 'rate_limited':
      return 'Not verified this time (too many checks in a row). Moving on.'
    case 'timeout':
      return 'Not verified: your endpoint took too long to answer. Moving on.'
    case 'status':
    case 'body':
    case 'not_increased':
      return 'Not verified: your endpoint did not answer as this page expects yet. Moving on.'
    default:
      return 'Not verified this time. Moving on.'
  }
}

/** Friendly text for the Worker's endpoint refusal codes. */
export function endpointRefusal(reason: string): string {
  switch (reason) {
    case 'not_https':
      return 'Use the https:// URL from your stack outputs.'
    case 'host':
      return 'That does not look like an API Gateway URL (https://<id>.execute-api.<region>.amazonaws.com/<stage>/).'
    case 'path':
      return 'Keep just the stage, for example …amazonaws.com/prod/.'
    case 'port':
    case 'userinfo':
    case 'bad_characters':
      return 'Paste the URL exactly as the output shows it, without extra characters.'
    case 'rate_limited':
      return 'That was a lot of saves. Try again in a minute.'
    default:
      return 'That URL was not accepted.'
  }
}

/**
 * The same shape the Worker accepts, used only while the Worker cannot be
 * reached, so a URL kept in this browser alone is still a real endpoint.
 */
const API_GATEWAY = /^https:\/\/[a-z0-9]{10}\.execute-api\.[a-z]{2}(?:-gov|-iso[a-z]?)?-[a-z]+-[1-9]\.amazonaws\.com\/([A-Za-z0-9_-]{1,128})\/?$/

export function localEndpoint(input: string): string | null {
  const m = API_GATEWAY.exec(input.trim())
  if (!m) return null
  return input.trim().replace(/\/?$/, '/')
}

/** Resolves after at least `ms`, whatever `work` does, so a fast verdict still reads. */
export async function atLeast<T>(work: Promise<T>, ms: number): Promise<T> {
  const [result] = await Promise.all([work, new Promise((r) => setTimeout(r, ms))])
  return result
}
