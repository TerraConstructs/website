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

test('a page left without "Next" is recorded once; one left by "Next" is not recorded twice', async () => {
  const advances: string[] = []
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input)
    if (url.endsWith('/api/sessions')) return new Response(JSON.stringify({ sessionId: 's1', token: 'a'.repeat(64) }), { status: 201 })
    const step = JSON.parse(String(init?.body)).step as string
    advances.push(step)
    const steps = Object.fromEntries(advances.map((s) => [s, { state: 'done', reason: 'no_check' }]))
    return new Response(JSON.stringify({ step, state: 'done', reason: 'no_check', steps }), { status: 200 })
  }) as typeof fetch
  const { advance, getProgress, visit } = await import('./store')
  const settle = () => new Promise((r) => setTimeout(r, 20))

  visit('aws/a', false)
  visit('aws/a', false) // a re-render of the same page leaves nothing
  visit('aws/b', false) // sidebar: a is left
  await settle()
  assert.deepEqual(advances, ['aws/a'])
  assert.equal(getProgress().steps['aws/a']?.state, 'done')

  await advance('aws/b', false) // "Next" records b itself...
  visit('aws/c', false) // ...so arriving on c does not record b again
  await settle()
  assert.deepEqual(advances, ['aws/a', 'aws/b'])

  visit('aws/a', false) // back to a recorded page, then away again: nothing new for a
  visit('aws/c', false)
  await settle()
  assert.deepEqual(advances, ['aws/a', 'aws/b', 'aws/c'])
})
