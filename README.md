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

## History

The Vite/React version of this site is on the `v2` branch, and an earlier
Next.js version on `main`. Both are kept for reference. The AWS workshop was
previously a Hugo site at
[TerraConstructs/intro-workshop](https://github.com/TerraConstructs/intro-workshop)
(archived); that repository still holds the `code/` sample projects the workshop
walks through.
