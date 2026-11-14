import assert from 'node:assert/strict'
import { test } from 'node:test'

// The store reads the Worker address when it loads, so set it before importing.
process.env.NEXT_PUBLIC_WORKSHOP_API = 'http://worker.test'
const STEP = 'aws/typescript/hello-cdk/apigw'

test('a fast verdict is shown only after the spinner: never green while still verifying', async () => {
  const calls: string[] = []
  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = String(input)
    calls.push(url)
    const body = url.endsWith('/api/sessions')
      ? { sessionId: 's1', token: 'a'.repeat(64) }
      : { step: STEP, state: 'verified', passed: true, reason: 'ok', steps: { [STEP]: { state: 'verified', reason: 'ok' } } }
    return new Response(JSON.stringify(body), { status: url.endsWith('/api/sessions') ? 201 : 200 })
  }) as typeof fetch

  const { advance, getProgress, subscribeProgress, MIN_VERIFY_MS } = await import('./store')
  const seen: { verifying: string | null; segment: string | undefined; flash: string | undefined; at: number }[] = []
  const t0 = Date.now()
  subscribeProgress(() => {
    const s = getProgress()
    seen.push({ verifying: s.verifying, segment: s.steps[STEP]?.state, flash: s.flash?.state, at: Date.now() - t0 })
  })

  const result = await advance(STEP, true)
  assert.deepEqual(result, { state: 'verified', reason: 'ok' })
  assert.ok(calls.some((u) => u === 'http://worker.test/api/session/advance'))
  // while the spinner is on, the segment is not yet green
  for (const s of seen.filter((x) => x.verifying === STEP)) assert.notEqual(s.segment, 'verified', JSON.stringify(seen))
  // the one update that ends verifying also makes it green and starts the settle
  const settled = seen.find((x) => x.verifying === null && x.segment === 'verified')
  assert.ok(settled, JSON.stringify(seen))
  assert.equal(settled.flash, 'verified')
  assert.ok(settled.at >= MIN_VERIFY_MS - 5, `settled at ${settled.at} ms`)
})

test('a page counts when its end is reached, never by navigating alone, and never twice', async () => {
  const advances: string[] = []
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input)
    if (url.endsWith('/api/sessions')) return new Response(JSON.stringify({ sessionId: 's1', token: 'a'.repeat(64) }), { status: 201 })
    const step = JSON.parse(String(init?.body)).step as string
    advances.push(step)
    const steps = Object.fromEntries(advances.map((s) => [s, { state: 'done', reason: 'no_check' }]))
    return new Response(JSON.stringify({ step, state: 'done', reason: 'no_check', steps }), { status: 200 })
  }) as typeof fetch
  const { advance, getProgress, reachEnd, visit } = await import('./store')
  const settle = () => new Promise((r) => setTimeout(r, 20))

  visit('aws/a', false)
  visit('aws/b', false) // a left by the sidebar, its end never reached: nothing
  await settle()
  assert.deepEqual(advances, [])
  assert.equal(getProgress().steps['aws/a'], undefined)

  reachEnd('aws/b', false) // the end of b comes into view: done at once, without leaving
  reachEnd('aws/b', false)
  await settle()
  assert.deepEqual(advances, ['aws/b'])
  assert.equal(getProgress().steps['aws/b']?.state, 'done')

  await advance('aws/b', false) // "Next" on a page already recorded does not record it again
  visit('aws/c', false)
  await settle()
  assert.deepEqual(advances, ['aws/b'])

  reachEnd('aws/c', false)
  await advance('aws/c', false) // "Next" while that record is still in flight: still one call
  await settle()
  assert.deepEqual(advances, ['aws/b', 'aws/c'])

  visit('aws/check1', true)
  visit('aws/d', false) // a page with a check, left unread: nothing
  await settle()
  assert.deepEqual(advances, ['aws/b', 'aws/c'])

  visit('aws/check2', true)
  reachEnd('aws/check2', true) // reaching the end of a page with a check records nothing yet...
  await settle()
  assert.deepEqual(advances, ['aws/b', 'aws/c'])
  visit('aws/d', false) // ...leaving it by the sidebar verifies it quietly
  await settle()
  assert.deepEqual(advances, ['aws/b', 'aws/c', 'aws/check2'])
})
