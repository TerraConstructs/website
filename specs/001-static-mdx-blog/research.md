# Research: Static MDX Blog

**Branch**: `001-static-mdx-blog` | **Date**: 2025-12-18

This document consolidates research findings for the static MDX blog feature implementation.

**Sources**:
- [user-research.md](./user-research.md) - Comprehensive user research with FR comparison
- Agent research: SSG, image optimization, reading time, MDX pipeline, Shiki, React versions

## Prior Work

No prior related features in the beads issue tracker. This is a greenfield blog subsystem.

## Decision 1: SSG Strategy

**Question**: Use vite-plugin-ssr (Vike), VitePress, vite-plugin-press, or custom prerender script?

**Decision**: **Custom prerender script**

**Rationale**:
- Maximum control over build output with zero framework dependencies
- Aligns with "extend, don't replace" project philosophy
- Simple 50-100 line Node.js script using Vite's build API
- Easy to debug and maintain

**Alternatives Considered**:

| Option | Rejected Because |
|--------|------------------|
| Vike (vite-plugin-ssr) | Overkill for 2 page templates (index + post); adds routing conventions not needed |
| VitePress | Rigid documentation-site conventions; conflicts with sub-path blog integration |
| vite-plugin-press | No rehype plugin config (blocks TOC extraction); no Shiki theme customization; double-parse inefficiency |

**Implementation**: Script will:
1. Glob `blog/*/index.mdx` files
2. For each post, call `vite.build()` with React entry point
3. Generate `dist/blog/[slug]/index.html` for each post
4. Generate `dist/blog/index.html` listing page
5. Generate `search-index.json` for Fuse.js

## Decision 2: Image Optimization

**Question**: vite-imagetools vs manual optimization vs CDN?

**Decision**: **Use both vite-plugin-image-optimizer AND vite-plugin-imagetools**

**Rationale**:
- `vite-plugin-image-optimizer`: Global compression for all images (WebP/AVIF)
- `vite-plugin-imagetools`: On-demand responsive variants via URL query (`?w=400&format=webp`)
- Complementary, not competing tools

**Alternatives Considered**:

| Option | Rejected Because |
|--------|------------------|
| Manual pre-commit optimization | Developer friction; easy to forget |
| CDN-only (Cloudflare) | Adds external dependency; less control |
| vite-imagetools alone | Doesn't auto-compress co-located assets |

## Decision 3: Reading Time Calculation

**Question**: Vite plugin vs remark plugin?

**Decision**: **remark-reading-time**

**Rationale**:
- Hooks directly into MDX compilation pipeline
- No redundant file parsing
- Exports `minutesToRead` via frontmatter
- Well-maintained, standard approach

**Alternatives Considered**:

| Option | Rejected Because |
|--------|------------------|
| Custom Vite plugin | Redundant parsing; reinventing the wheel |
| reading-time npm in build script | Separate step; harder to integrate with frontmatter exports |

## Decision 4: React Version

**Question**: React 18 or 19?

**Decision**: **React 19.x**

**Rationale**:
- Latest stable release (Dec 2025)
- Performance improvements, new compiler
- Backward compatible for this project's needs
- Future-proof for Actions API if needed

## Technology Stack (Final)

### Core Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | 19.x | UI runtime |
| `react-dom` | 19.x | DOM renderer |
| `@mdx-js/rollup` | latest | MDX compilation |
| `fuse.js` | latest | Fuzzy search (~7KB) |
| `shiki` | latest | Syntax highlighting engine |
| `@shikijs/rehype` | latest | Shiki-rehype integration |

### MDX Pipeline Plugins

| Package | Purpose |
|---------|---------|
| `remark-frontmatter` | Parse YAML frontmatter |
| `remark-mdx-frontmatter` | Export frontmatter as module |
| `remark-reading-time` | Calculate reading time |
| `rehype-slug` | Add IDs to headings |
| `rehype-autolink-headings` | Make headings self-linking |
| `@stefanprobst/rehype-extract-toc` | Extract TOC structure |

### Image Optimization

| Package | Purpose |
|---------|---------|
| `vite-plugin-image-optimizer` | Global image compression |
| `vite-plugin-imagetools` | Responsive image variants |

### Build Utilities

| Package | Purpose |
|---------|---------|
| `glob` | File discovery for prerender script |

## Vite Configuration

Recommended plugin order in `vite.config.mjs`:

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mdx from '@mdx-js/rollup';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';
import remarkReadingTime from 'remark-reading-time';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeShiki from '@shikijs/rehype';
import { transformerNotationHighlight } from '@shikijs/transformers';

export default defineConfig({
  plugins: [
    react(),
    mdx({
      remarkPlugins: [
        remarkFrontmatter,
        remarkMdxFrontmatter,
        remarkReadingTime,
      ],
      rehypePlugins: [
        rehypeSlug,
        [rehypeAutolinkHeadings, { behavior: 'wrap' }],
        [rehypeShiki, {
          themes: {
            light: 'github-light', // or custom theme
            dark: 'github-dark',
          },
          transformers: [transformerNotationHighlight()],
        }],
      ],
    }),
  ],
});
```

## Functional Requirement Coverage

All 16 functional requirements from spec.md are achievable with this stack:

| FR | Requirement | Solution |
|----|-------------|----------|
| FR-001 | Static pages from MDX | @mdx-js/rollup + prerender script |
| FR-002 | /blog/\<slug\> URLs | Prerender script output structure |
| FR-003 | Blog index at /blog | Prerender script + PostList component |
| FR-004 | Multiple tags per post | remark-mdx-frontmatter exports |
| FR-005 | Tag filtering | Client-side React state |
| FR-006 | Floating TOC (desktop) | rehype-extract-toc + TOC component |
| FR-006a | TOC drawer (mobile) | TOCDrawer component |
| FR-007 | Active section highlighting | useScrollSpy hook (Intersection Observer) |
| FR-008 | Syntax highlighting | @shikijs/rehype with dual themes |
| FR-008a | Line highlighting | @shikijs/transformers |
| FR-008b | Copy button | CodeBlock component |
| FR-008c | Expandable code | CodeBlock component |
| FR-009 | Search index | Prerender script generates JSON |
| FR-010 | Client-side search | Fuse.js + useSearch hook |
| FR-011 | Dark mode | Shiki dual themes + Tailwind dark: |
| FR-012 | Reading time | remark-reading-time |
| FR-013 | Co-located images | Vite native + image plugins |
| FR-014 | Responsive design | Tailwind mobile-first |
| FR-015 | Author byline | Frontmatter export |
| FR-016 | SeriesNav component | MDX custom component |

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| React 19 compatibility issues | Stick to stable APIs; no experimental features |
| Bundle size exceeds 120KB | Tree-shaking, lazy-load search index |
| Prerender script complexity | Keep simple; ~100 lines max |
| Shiki theme mismatch | Create custom theme JSON matching landing page tokens |

---

## Open Questions (Session 2 - 2025-12-19)

**Context**: During MVP validation testing, critical gaps were discovered between the design specifications and the actual implementation. The following questions need resolution before proceeding.

### Question 5: Development Server Routing

**Problem**: How should `/blog/*` routes be served during `pnpm run dev`?

**Decision**: **Option A: Custom Middleware (Refined)**

**Rationale**:
- Keeps the landing page lightweight (no React Router needed for the main site).
- Mimics the production SSG structure (separate HTML entry points) better than a single SPA.
- The `blogDevServer` plugin will be enhanced to properly serve the blog React app for any `/blog/*` request, allowing the React app to handle the client-side routing within that namespace.


**Current State**:
- Landing page (`/`) works via `index.html`
- Blog routes (`/blog/*`) are captured by the SPA at index.html but should should route to the blog
- Session 2 created a custom `blogDevServer` middleware + `blog-dev.html` as a workaround - but this needs proper research and design


**Alternatives considered**:

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| A. Custom middleware | Intercept `/blog/*` and serve blog-dev.html | Works immediately | Not part of original design; extra code to maintain |
| B. Multi-page app config | Add blog HTML entries to Vite's rollupOptions.input | Standard Vite approach | Requires HTML file per route or wildcard handling |
| C. SPA fallback | Configure Vite to serve index.html for all routes, use React Router | Standard SPA approach | Requires client-side router; not SSG |
| D. Dev-only prerender | Run prerender script on file change during dev | Matches production | Slow iteration; defeats HMR purpose |

### Question 6: Prerender Script Implementation

**Problem**: The current prerender script doesn't match the design specification (currently does CSR shells instead of SSG).

**Design Spec (website-xvr, website-mfq)**:
1. Use Vite build API (`vite.build()`)
2. Import MDX modules after build
3. Render with `ReactDOMServer.renderToString()`
4. Generate complete HTML with hydration scripts
5. Include proper meta tags from frontmatter

**Current Implementation** (`scripts/prerender-blog.mjs`):
1. Manually parses frontmatter with regex
2. Generates simple HTML shells with `<script src="/src/blog/index.tsx">`
3. Does NOT use Vite build API
4. Does NOT use ReactDOMServer
5. Does NOT generate complete SSG output

**Options**:

| Option | Description | Effort | Risk |
|--------|-------------|--------|------|
| A. Rewrite to match design | Implement Vite build API + ReactDOMServer approach | High | Medium - new territory |
| B. Keep shells + fix hydration | Fix MDX config so client-side rendering works | Medium | Low - incremental fix |
| C. Hybrid approach | Use Vite build for assets, simple shells for HTML | Medium | Low - pragmatic |

**Decision Needed**: Is full SSG (Option A) required for MVP, or is client-side hydration (Option B) acceptable?

**Decision**: **Option A: Rewrite to match design (True SSG)**

**Rationale**:
- **Requirement Compliance**: FR-001 explicitly requires "static pages from markdown".
- **SEO/Performance**: Prerendering content is essential for a blog.
- **Implementation**: The script will be updated to:
    1.  Perform an SSR build using `vite.build({ ssr: true, ... })` to generate a temp node-executable bundle.
    2.  Load this bundle.
    3.  For each post, render the component tree to a string using `ReactDOMServer.renderToString()`.
    4.  Inject the HTML into the template.
    5.  Perform a client-side build to generate the assets for hydration.

### Question 7: Missing MDX Pipeline Configuration

**Problem**: The Vite config is missing plugins specified in the design (`remark-reading-time`, `rehype-extract-toc`).


**Design Spec (website-2np, website-9gz)**:
```javascript
remarkPlugins: [
  remarkFrontmatter,
  remarkMdxFrontmatter,
  remarkReadingTime,        // ❌ NOT INSTALLED
]
rehypePlugins: [
  rehypeSlug,
  rehypeAutolinkHeadings,
  rehypeShiki,
  rehypeExtractToc,         // ❌ INSTALLED BUT NOT CONFIGURED
]
```

**Current Implementation**:
- `remark-reading-time` is NOT in package.json
- `@stefanprobst/rehype-extract-toc` IS in package.json but NOT in vite.config.mjs

**Impact**:
- MDX modules don't export `toc` → PostPage/BlogIndex can't render TOC
- MDX modules don't export `readingTime` → reading time display broken
- Blog posts fail to load because expected exports are missing

**Decision Needed**:
1. Install `remark-reading-time`
2. Configure `rehype-extract-toc` in vite.config.mjs
3. Verify MDX exports match component expectations

**Decision**: **Install and Configure**

**Rationale**:
- Essential for FR-006 (TOC) and FR-012 (Reading Time).
- **Action Items**:
    1.  `pnpm add -D remark-reading-time`
    2.  Update `vite.config.mjs` to include `remarkReadingTime` and `rehypeExtractToc`.

### Question 8: Landing Page vs Blog Header/Footer Consistency

**Problem**: Should the blog use identical header/footer to landing page, or a simplified version?

**Current State**:
- Landing page: Fixed header with backdrop blur, always-dark footer
- Blog (BlogLayout): Similar but not identical styles

**Options**:
| Option | Description |
|--------|-------------|
| A. Shared components | Extract header/footer to shared location, use in both |
| B. Visual match only | Keep separate implementations but ensure visual consistency |
| C. Different designs | Blog has simpler navigation (acceptable for MVP) |

**Decision Needed**: What level of consistency is required for MVP?

**Decision**: **Option B: Visual Match Only**

**Rationale**:
- **Tech Stack Divergence**: Landing page is vanilla HTML/JS; Blog is React. Sharing code would require over-engineering (e.g., Web Components).
- **Maintenance**: The landing page is stable. The blog is new. Maintaining two separate but visually similar implementations is acceptable and simpler for the build process.
- **Action**: Ensure `BlogLayout.tsx` styles match `index.html` styles as closely as possible, including dark mode behavior.

---
