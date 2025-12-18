# Technical Decisions: Static MDX Blog

**Feature Branch**: `001-static-mdx-blog`
**Created**: 2025-12-18
**Status**: Approved

This document captures technology choices for the blog feature implementation.
These decisions are separate from the functional specification to maintain
technology-agnostic requirements.

## Architecture Overview

The blog is a **separate subsystem** from the landing page, isolated via Vite's
code splitting. React and associated dependencies load only on `/blog/*` routes.

```
Landing Page (/)          Blog (/blog/*)
├── Vanilla JS            ├── React 19
├── highlight.js          ├── MDX + @mdx-js/rollup
└── ~50KB total           ├── Shiki (syntax highlighting)
                          ├── Fuse.js (search)
                          └── ~150KB additional (code-split)
```

## Technology Decisions

### 1. JSX Runtime: React 19

**Decision**: Use React 19 for blog pages.

**Rationale**:
- Maximum MDX compatibility for interactive components in posts
- Mature ecosystem for rehype/remark plugins
- Code-split from landing page per constitution rule
- Native support for document metadata (`<title>`, `<meta>`) simplifies SEO

**Constraints**:
- React bundles MUST NOT load on `index.html`
- Blog entry points use separate Vite input configuration

**References**:
- [@mdx-js/rollup](https://mdxjs.com/packages/rollup/) - Official MDX Vite integration
- [MDX Getting Started](https://mdxjs.com/docs/getting-started/)

### 2. Syntax Highlighting: Shiki

**Decision**: Use Shiki for blog code blocks (build-time).

**Rationale**:
- VS Code-quality highlighting with accurate tokenization
- Theme portability - can create custom theme matching landing page colors
- Future: Landing page will migrate to Shiki for consistency

**Implementation**:
- Use `rehype-shiki` or `@shikijs/rehype` in MDX pipeline
- Create custom theme JSON based on existing highlight.js colors
- Precompute at build time (no runtime Shiki)

**References**:
- [Shiki Documentation](https://shiki.style/)
- [rehype-shiki](https://github.com/rehypejs/rehype-shiki)

### 3. Search Implementation (Fuse.js)

**Decision**: Client-side fuzzy search with a build-time generated index.

**Rationale**:
- Typo tolerance improves UX for varied user input.
- Lightweight (7KB) and fits the React 19 "Client Component" pattern.

### Index Schema (`dist/search-index.json`)
The custom prerender script generates a lightweight JSON file containing only metadata needed for results.
```json
[
  {
    "slug": "getting-started",
    "title": "Getting Started with TerraConstructs",
    "excerpt": "Learn how to provision infrastructure...",
    "tags": ["tutorial", "aws"],
    "date": "2025-01-15"
  }
]
```
*Note: Searching title, tags, and excerpts is sufficient for <= 100 posts.*

### Runtime Logic
- **Lazy Loading**: The `search-index.json` is fetched only when the user focuses the search input.
- **Hook**: A `useSearch` hook memoizes the Fuse instance and results state.
- **Configuration**: `threshold: 0.3`, `keys: ['title', 'tags', 'excerpt']` (weighted).

### 4. Tag System: Inline Filtering

**Decision**: Client-side tag filtering on `/blog` index page.

**Rationale**:
- Simpler than generating separate `/blog/tag/<name>` pages
- Fewer static pages to build and maintain
- Instant filtering without page navigation

**Implementation**:
- All posts loaded on `/blog` index
- Tag chips filter visible posts via React state
- URL hash for shareable filtered views (e.g., `/blog#tag=aws`)
- No separate tag pages generated

**Trade-offs**:
- (-) Less SEO value than dedicated tag pages
- (+) Simpler build, faster development
- (+) Better UX for exploring multiple tags

### 5. Table of Contents: rehype-extract-toc + Intersection Observer

**Decision**: Build-time TOC extraction with client-side scroll tracking.

**Rationale**:
- `rehype-extract-toc` provides structured heading data at build time
- Intersection Observer API for performant scroll tracking
- No additional runtime dependencies

**Implementation**:
- MDX pipeline extracts TOC structure to frontmatter/exports
- React component renders floating TOC on desktop (>=768px)
- Collapsible drawer on mobile (<768px)
- Intersection Observer tracks visible headings
- Active section highlighted in TOC

**References**:
- [@stefanprobst/rehype-extract-toc](https://www.npmjs.com/package/@stefanprobst/rehype-extract-toc)
- [Scroll Spy with Intersection Observer](https://dev.to/fazzaamiarso/add-toc-with-scroll-spy-in-astro-3d25)

### 6. Code Block Enhancements

**Decision**: Shiki with client-side interactivity layer.

**Build-time (Shiki)**:
- Syntax highlighting with custom theme
- Line number generation
- Line range metadata for highlighting (e.g., `{5-10}`)

**Client-side (React)**:
- Copy-to-clipboard button on all code blocks
- Line range highlighting (visual emphasis on specified lines)
- Expandable/collapsible wrapper for long code blocks (>30 lines)

**MDX Syntax**:
~~~mdx
```typescript {5-10} showLineNumbers collapsible
// Lines 5-10 will be highlighted
// Code block will be collapsible if >30 lines
```
~~~

**Implementation**:
- Use `@shikijs/transformers` for line highlighting metadata
- React `<CodeBlock>` component wraps Shiki output
- Client JS adds copy button and collapse toggle

### 7. Series Navigation Component

**Decision**: React `<SeriesNav>` component for multi-part posts.

**Rationale**:
- Tags group series posts for filtering
- In-post component provides explicit navigation between parts
- Authors control series structure in MDX content

**Usage in MDX**:
```mdx
<SeriesNav
  title="Beyond Terraform"
  parts={[
    { slug: "terraform-pain-points", title: "Part 1: The Problem" },
    { slug: "terraform-turning-point", title: "Part 2: Community & Ecosystem" },
    { slug: "spec-driven-development", title: "Part 3: AI & Spec-Driven Coding" },
    { slug: "gridapi-typed-state", title: "Part 4: GridAPI in Practice" },
  ]}
  current="terraform-turning-point"
/>
```

**Component Features**:
- Displays series title and all parts
- Highlights current part
- Links to other parts
- Responsive: horizontal on desktop, vertical on mobile

### 8. MDX Pipeline

**Decision**: @mdx-js/rollup with remark/rehype plugins.

**Plugin Chain**:
```
MDX Source
  ↓
remark-frontmatter     → Parse YAML frontmatter
remark-mdx-frontmatter → Expose frontmatter as export
remark-reading-time    → Calculate minutes to read
  ↓
rehype-slug            → Add IDs to headings
rehype-extract-toc     → Extract TOC structure
@shikijs/rehype        → Syntax highlighting + line metadata
  ↓
React Component (with <CodeBlock>, <SeriesNav>)
```

**Vite Configuration**:
```js
import mdx from '@mdx-js/rollup';
import { defineConfig } from 'vite';
import rehypeShiki from '@shikijs/rehype';

export default defineConfig({
  plugins: [
    {
      enforce: 'pre',
      ...mdx({
        remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkReadingTime],
        rehypePlugins: [
          rehypeSlug,
          rehypeExtractToc,
          [rehypeShiki, { themes: { light: 'github-light', dark: 'github-dark' } }]
        ],
      }),
    },
  ],
});
```

### 9. Build Output Structure

**Decision**: Multi-page app with separate entry points.

```
dist/
├── index.html                    # Landing page (vanilla JS)
├── assets/
│   ├── js/
│   │   ├── main.[hash].js        # Landing page bundle
│   │   └── blog.[hash].js        # Blog React bundle (code-split)
│   └── css/
│       └── style.[hash].css      # Shared Tailwind styles
└── blog/
    ├── index.html                # Blog listing page
    ├── getting-started/
    │   └── index.html            # Individual post
    └── advanced-patterns/
        └── index.html
```

## Dependency Summary

| Package | Purpose | Size (gzip) |
|---------|---------|-------------|
| react@19 | JSX runtime | ~40KB |
| react-dom@19 | DOM rendering | ~40KB |
| @mdx-js/rollup | MDX compilation | build-only |
| shiki | Syntax highlighting | build-only |
| @shikijs/transformers | Line highlighting | build-only |
| fuse.js | Client search | ~7KB |
| rehype-slug | Heading IDs | build-only |
| @stefanprobst/rehype-extract-toc | TOC extraction | build-only |

**Estimated Blog Bundle**: ~90KB JS (code-split, not loaded on landing page)

## Custom React Components

| Component | Purpose | Props |
|-----------|---------|-------|
| `<CodeBlock>` | Wraps Shiki output with copy/collapse | `language`, `highlighted`, `collapsible` |
| `<SeriesNav>` | Multi-part series navigation | `title`, `parts[]`, `current` |
| `<TOC>` | Floating table of contents | `headings[]`, `activeId` |
| `<TOCDrawer>` | Mobile collapsible TOC | `headings[]`, `activeId`, `isOpen` |

## Resolved Decisions

1. **SSG Strategy**: **Custom Node.js Prerender Script**.
   - **Why**: Avoids "virtual module" limitations of plugins. Zero runtime overhead.
2. **Image Optimization**: **`vite-plugin-imagetools`** (responsive) + **`vite-plugin-image-optimizer`** (assets).
3. **Reading Time**: **`remark-reading-time`**.
   - **Why**: Integrates cleanly into the MDX pipeline.
