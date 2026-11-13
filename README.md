# terraconstructs.dev

The TerraConstructs website: landing page, blog, and the AWS workshop — plus the
infrastructure that serves them.

Built with Next.js (App Router) and exported as a static site to S3 behind
CloudFront.

## Layout

```
app/            routes; /blog/[slug] and /workshops/[[...slug]] are the dynamic ones
content/        MDX — blog posts and the workshop tree
components/     UI, including the MDX component map
lib/            content layer: blog.ts, workshops.ts, markdown.ts
infra/          cdktn stack (S3 + CloudFront + ACM + Route53)
cdktf.out/      synthesized config and terraform state (committed)
scripts/        build and deploy tooling
```

## Develop

```bash
pnpm install
pnpm dev
```

## Build

```bash
pnpm build
```

`output: 'export'` with `trailingSlash: true`. The trailing slash is
load-bearing: it makes Next emit `workshops/aws/index.html`, which is what the
CloudFront viewer-request function rewrites extensionless URLs to.

The build also renders one Open Graph card per route into `public/og/`
(`scripts/generate-og.mjs`) and then verifies every emitted route has one.

## Deploy

```bash
# infrastructure (rarely)
pnpm synth
aws-vault exec --no-session tcons-vincent -- tofu -chdir=cdktf.out/stacks/landing apply

# content
pnpm build
aws-vault exec --no-session tcons-vincent -- ./scripts/deploy.sh
```

`deploy.sh` reads the bucket and distribution from terraform state, syncs with
per-file-type `Cache-Control`, and invalidates. Pass `--dryrun` to see what
would change.

## Redirects

There is no Next redirect config — `redirects()` is inert under `output:
'export'`. Redirects live in the CloudFront viewer-request function in
`infra/main.ts`:

- **`aws-workshop.terraconstructs.dev`** — the retired Hugo workshop. Mapped by
  rule rather than a table (drop `.html`, drop each segment's ordering prefix,
  re-root under `/workshops/aws/`), which keeps the function well inside
  CloudFront's 10 KB limit. `scripts/workshop-redirects.json` records all 90
  original mappings and serves as the fixture for that rule.
- **Old blog URLs** — the previous site's date-prefixed slugs. Only
  year-in-review was ported and redirects to its own URL; the rest land on the
  blog index.

## Workshop content

`content/workshops/<locale>/<cloud>/…`. Numeric filename prefixes order the tree
and are stripped from every URL segment, so ordering cannot disagree with a
`weight` field — it did in the Hugo original. `index.mdx` is a section's own
landing page.

Adding a sibling track (`30-python/` next to `20-typescript/`) produces routes,
sidebar entries and prev/next with no code change.

`scripts/convert-workshop.mjs` performed the one-time Hugo→MDX conversion. It
refuses to overwrite the committed content without `--force`; the MDX is the
source of truth now.

## Workshop progress

The workshop pages track progress through a small Cloudflare Worker (its
source is not in this repository). Everything dynamic is client-side; the pages still build as a static export and read fine without it.

- `components/workshop/progress/`: the progress bar (one segment per page:
  green verified, yellow moved on but not verified, blue done with nothing to
  verify, empty not reached), the "Next" card that asks the Worker to verify the
  page before moving on (moving on is always allowed), the endpoint card, the
  optional "put yourself on the board" invite, and the code-block endpoint fill.
- `lib/progress/`: `store.ts` (session token in `localStorage`, created lazily
  on the first progress action, sent as a bearer token; never cookies),
  `model.ts` (pure helpers, tested with `pnpm test`).
- Frontmatter, per page: `progress.capture` (`api` or `viewer`) shows the
  endpoint card; `progress.check` declares what the Worker verifies on "Next".
  The site only reads whether a check exists; the Worker gets the check itself
  from content generated out of this frontmatter (the schema is documented
  with the Worker), so the browser sends only the page id.
- In shell blocks, write `curl <Endpoint />hello` (or `<Endpoint name="viewer" />`)
  instead of a hard-coded URL. It renders as the documented example
  (`https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/`) and becomes
  the attendee's own endpoint once they saved one.

The Worker's address comes from `NEXT_PUBLIC_WORKSHOP_API`: `.env.development`
sets `http://localhost:8787`, `.env.production` the workers.dev URL. There is
no fallback: with the variable unset, progress tracking is off. The CloudFront CSP allows
that origin in `connect-src` (`infra/main.ts`). With the Worker unreachable the
progress UI stays as it was and "Next" just navigates.

Local development, end to end (Worker under `wrangler dev`, a stub API Gateway
endpoint, and this site): from the Worker's checkout run

```bash
demo/scripts/dev.sh <path-to-this-website-checkout>
```

then open http://localhost:3000/workshops/aws/ and use
`http://127.0.0.1:8789/prod/` as your endpoint.

## History

The Vite/React version of this site is on the `v2` branch, and an earlier
Next.js version on `main`. Both are kept for reference. The AWS workshop was
previously a Hugo site at
[TerraConstructs/intro-workshop](https://github.com/TerraConstructs/intro-workshop)
(archived); that repository still holds the `code/` sample projects the workshop
walks through.
