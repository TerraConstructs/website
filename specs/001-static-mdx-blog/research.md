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
