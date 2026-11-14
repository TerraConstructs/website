import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  atLeast,
  EXAMPLE_ENDPOINTS,
  expandEndpointPlaceholders,
  fillEndpoints,
  localEndpoint,
  segmentStates,
  summarize,
  verdictMessage,
} from './model'

test('placeholders expand to the documented example, with ranges for the client', () => {
  const src = 'curl <Endpoint />\ncurl <Endpoint />hello\ncurl <Endpoint name="viewer" />'
  const { code, ranges } = expandEndpointPlaceholders(src)
  assert.equal(
    code,
    `curl ${EXAMPLE_ENDPOINTS.api}\ncurl ${EXAMPLE_ENDPOINTS.api}hello\ncurl ${EXAMPLE_ENDPOINTS.viewer}`,
  )
  assert.deepEqual(
    ranges.map((r) => [r.slot, code.slice(r.start, r.end)]),
    [
      ['api', EXAMPLE_ENDPOINTS.api],
      ['api', EXAMPLE_ENDPOINTS.api],
      ['viewer', EXAMPLE_ENDPOINTS.viewer],
    ],
  )
})

test('code without placeholders is untouched', () => {
  const src = 'cdktn deploy\n<Endpointx /> <endpoint />'
  assert.deepEqual(expandEndpointPlaceholders(src), { code: src, ranges: [] })
})

test('copied code carries the endpoint the attendee sees, never the placeholder markup', () => {
  const own = 'https://abcdefghij.execute-api.eu-west-1.amazonaws.com/prod/'
  const { code, ranges } = expandEndpointPlaceholders('curl <Endpoint />hello\ncurl <Endpoint name="viewer" />')
  assert.equal(fillEndpoints(code, ranges, {}), code)
  assert.equal(fillEndpoints(code, ranges, { api: own }), `curl ${own}hello\ncurl ${EXAMPLE_ENDPOINTS.viewer}`)
})

test('segment states follow the reading order, unreached pages are empty', () => {
  const steps = ['a', 'b', 'c', 'd'].map((id) => ({ id, title: id, href: `/${id}` }))
  const states = segmentStates(steps, { a: { state: 'done' }, b: { state: 'verified' }, d: { state: 'unverified' } })
  assert.deepEqual(states, ['done', 'verified', 'empty', 'unverified'])
  assert.deepEqual(summarize(states), { verified: 1, unverified: 1, done: 1, reached: 3, total: 4 })
})

test('verdict messages stay calm', () => {
  assert.match(verdictMessage('verified', 'ok'), /^Verified/)
  for (const r of ['no_endpoint', 'timeout', 'status', 'rate_limited', 'network'])
    assert.match(verdictMessage('unverified', r), /Moving on\.$/)
})

test('the offline endpoint check matches only API Gateway URLs', () => {
  assert.equal(
    localEndpoint('https://abc123defg.execute-api.us-east-1.amazonaws.com/prod'),
    'https://abc123defg.execute-api.us-east-1.amazonaws.com/prod/',
  )
  for (const bad of [
    'http://abc123defg.execute-api.us-east-1.amazonaws.com/prod/',
    'https://abc123defg.execute-api.us-east-1.amazonaws.com.evil.example/prod/',
    'https://evil.example/prod/',
    'https://abc123defg.execute-api.us-east-1.amazonaws.com/prod/x',
    'javascript:alert(1)',
  ])
    assert.equal(localEndpoint(bad), null)
})

test('atLeast waits for the minimum even when the work is instant', async () => {
  const t0 = Date.now()
  assert.equal(await atLeast(Promise.resolve(7), 120), 7)
  assert.ok(Date.now() - t0 >= 110)
})
