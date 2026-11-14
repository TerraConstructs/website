import assert from 'node:assert/strict'
import { test } from 'node:test'
import { highlightToHtml } from './demos'
import { expandEndpointPlaceholders } from './progress/model'

const lineClasses = (html: string) => [...html.matchAll(/<span class="line([^"]*)"/g)].map((m) => m[1].trim())

test('tfplan rows are shaded by their Terraform action, stack prefix or not', async () => {
  const plan = ['cdk-workshop  + create', '  ~ update in-place', '-/+ destroy and then create', '      id = "x"'].join('\n')
  assert.deepEqual(lineClasses(await highlightToHtml(plan, 'tfplan')), [
    'plan-add',
    'plan-change',
    'plan-replace',
    '',
  ])
})

test('an endpoint in a fence is wrapped for the client, next to emphasised lines', async () => {
  const { code, ranges } = expandEndpointPlaceholders('# call it\ncurl <Endpoint />hello')
  const html = await highlightToHtml(
    code,
    'bash',
    new Set([2]),
    ranges.map((r) => ({ start: r.start, end: r.end, properties: { 'data-endpoint': r.slot } })),
  )
  assert.deepEqual(lineClasses(html), ['', 'hl'])
  assert.match(html, /data-endpoint="api"[^>]*>https:\/\/xxxxxxxxxx\.execute-api/)
  assert.doesNotMatch(html, /Endpoint/)
})
