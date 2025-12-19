# Implementation Plan: Static MDX Blog

**Branch**: `001-static-mdx-blog` | **Date**: 2025-12-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-static-mdx-blog/spec.md`
**Tech Decisions**: [tech.md](./tech.md)

## Summary

Add a static MDX blog to the TerraConstructs website with build-time generation, tag-based navigation, floating TOC with scroll tracking, and client-side fuzzy search. The blog is a separate subsystem from the landing page, using React 19 for MDX support while maintaining vanilla JS isolation for the main site through Vite code splitting.

## Technical Context

**Language/Version**: TypeScript/JavaScript (ES2022), React 19, Node.js 18+
**Primary Dependencies**: React 19, @mdx-js/rollup, Shiki, Fuse.js, rehype/remark plugins
**Storage**: N/A (static files - MDX content in `/blog` directory)
**Testing**: Manual validation per constitution (pnpm run dev, viewport testing, dark mode)
**Target Platform**: Static web (browsers, deployed via nginx/CDN)
**Project Type**: Web (extension of existing Vite project with separate blog entry point)
**Performance Goals**: <2s initial paint on 3G, <100ms search response, Lighthouse ≥90
**Constraints**: React MUST NOT load on landing page, blog bundle ~100-120KB (code-split)
**Scale/Scope**: Up to 100 posts without pagination, 310px-1920px responsive

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Design Gate (Phase 0)

| Principle | Requirement | Status | Notes |
|-----------|-------------|--------|-------|
| **I. Code Quality First** | Formatting passes `pnpm run format:check` | ✅ WILL COMPLY | All new code will follow established patterns |
| | Single quotes, semicolons, ES5 trailing commas | ✅ WILL COMPLY | React/MDX code follows same rules |
| | Dependencies require justification | ✅ JUSTIFIED | See tech.md for React, Shiki, Fuse.js rationale |
| | No inline event handlers (CSP) | ✅ WILL COMPLY | React event handlers are safe |
| **II. Manual Testing** | Verify via `pnpm run dev` | ✅ WILL COMPLY | Blog pages testable in dev server |
| | Viewport testing (310px, 768px, 1920px) | ✅ WILL COMPLY | TOC drawer/floating variants per viewport |
| | Dark mode validation | ✅ WILL COMPLY | Blog inherits landing page theme toggle |
| | Build verification (`pnpm run build`) | ✅ WILL COMPLY | Part of completion criteria |
| **III. UX Consistency** | Mobile-first responsive design | ✅ WILL COMPLY | Spec requires 310px-1920px |
| | Typography (Inter, JetBrains Mono) | ✅ WILL COMPLY | Shared Tailwind config |
| | Color system (ink, paper, accent) | ✅ WILL COMPLY | Shiki theme matches existing tokens |
| | WCAG 2.1 AA accessibility | ✅ WILL COMPLY | SC-003 requires 100% audit pass |
| | Core Web Vitals (LCP <2.5s, CLS <0.1) | ✅ WILL COMPLY | SC-001 requires <2s paint on 3G |
| **IV. SEO** | Semantic HTML, one h1 per page | ✅ WILL COMPLY | Each blog post gets single h1 title |
| | Meta tags (title, description, OG) | ✅ WILL COMPLY | Generated from frontmatter |
| | Lighthouse score ≥90 | ✅ WILL COMPLY | SC-007 requires this |
| **Technical Constraints** | Landing page remains vanilla JS | ✅ WILL COMPLY | React code-split to /blog/* only |
| | Blog uses Vite with code splitting | ✅ WILL COMPLY | Separate entry point per tech.md |
| | pnpm exclusively | ✅ WILL COMPLY | No npm/yarn |
| | CSP nonce injection via deployment | ✅ WILL COMPLY | Blog follows same pattern |

**Gate Status**: ✅ PASS - No violations. React dependency is explicitly permitted by constitution for blog subsystem.

### Post-Design Gate (Phase 1)

Re-evaluation after research and design completion.

| Aspect | Pre-Design | Post-Design | Notes |
|--------|------------|-------------|-------|
| **New Dependencies** | React 18 | React 19 | Updated per research; backward compatible |
| **Bundle Size** | ~100-120KB | ~100-120KB | Estimate unchanged; React 19 similar size |
| **Code Splitting** | Planned | Confirmed | Vite multi-entry with separate blog entry point |
| **Shiki Theme** | Custom needed | Custom JSON | Will match existing highlight.js tokens |
| **Image Optimization** | vite-imagetools | Both plugins | Added vite-plugin-image-optimizer for compression |
| **Reading Time** | Undecided | remark-reading-time | Cleanest integration with MDX pipeline |
| **SSG Approach** | Undecided | Custom prerender | ~100 line script; full control, no framework |

**Post-Design Gate Status**: ✅ PASS - All decisions align with constitution principles. No new violations introduced.

## Project Structure

### Documentation (this feature)

```text
specs/001-static-mdx-blog/
├── plan.md              # This file (/speckit.plan command output)
├── tech.md              # Technology decisions (already exists)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
# Existing landing page (unchanged)
src/
├── main.js              # Entry point (vanilla JS)
├── demo-section.js      # Demo UI
├── code-view.js         # Code renderer
├── guided-tour.js       # Tour functionality
├── tour-configs.js      # Tour definitions
├── icons.js             # Lucide icons
└── style.css            # Tailwind + custom styles

# New blog subsystem (React, code-split)
src/blog/
├── index.tsx            # Blog entry point (React)
├── components/
│   ├── BlogLayout.tsx   # Page wrapper with header/footer
│   ├── PostCard.tsx     # Post preview card for listings
│   ├── PostList.tsx     # Blog index listing
│   ├── SearchBar.tsx    # Fuse.js search input
│   ├── TagFilter.tsx    # Tag chip filtering
│   ├── TOC.tsx          # Floating table of contents (desktop)
│   ├── TOCDrawer.tsx    # Collapsible TOC (mobile)
│   ├── CodeBlock.tsx    # Shiki-wrapped code with copy/collapse
│   └── SeriesNav.tsx    # Multi-part series navigation
├── hooks/
│   ├── useScrollSpy.ts  # Intersection Observer for TOC
│   └── useSearch.ts     # Fuse.js search hook
└── utils/
    └── theme.ts         # Dark mode integration

# Blog content
blog/
├── getting-started/
│   ├── index.mdx        # Post content
│   └── diagram.png      # Co-located assets
└── [slug]/
    └── index.mdx

# Build plugins
plugins/
├── precompute-demo-code.js  # Existing (landing page)
├── mdx-pipeline.js          # New: MDX compilation with Shiki
└── search-index.js          # New: Generate Fuse.js index

# Build output
dist/
├── index.html               # Landing page (vanilla JS)
├── blog/
│   ├── index.html           # Blog listing (React)
│   └── [slug]/
│       └── index.html       # Individual posts (React)
└── assets/
    ├── js/
    │   ├── main.[hash].js   # Landing page bundle (~50KB)
    │   └── blog.[hash].js   # Blog React bundle (~100-120KB, code-split)
    └── css/
        └── style.[hash].css # Shared Tailwind styles
```

**Structure Decision**: Extended single project with blog as a separate subsystem. Blog code lives in `src/blog/` using React, while landing page remains vanilla JS in `src/`. Code splitting via Vite ensures React bundles only load on `/blog/*` routes. Content lives in `/blog` directory with co-located assets per post.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| React dependency (~80KB) | MDX requires JSX runtime for interactive components | Preact considered but MDX ecosystem is React-first; compatibility issues likely |
| Shiki instead of highlight.js | VS Code-accurate tokenization, custom themes | highlight.js already used on landing page but lacks precision for blog-quality code blocks |

**Note**: These are justified additions per constitution section "Blog Subsystem", not violations.

## Open Questions (from tech.md)

| Question | Status | Resolution |
|----------|--------|------------|
| SSG Strategy | ✅ RESOLVED | **Custom prerender script** - Maximum control, zero framework overhead, ~100 lines using Vite's build API. Vike/vite-plugin-press rejected for complexity and lack of rehype plugin customization. See [research.md](./research.md). |
| Image Optimization | ✅ RESOLVED | **Both plugins** - `vite-plugin-image-optimizer` for global compression + `vite-plugin-imagetools` for responsive srcset. Complementary, not competing. |
| Reading Time Calculation | ✅ RESOLVED | **remark-reading-time** - Hooks into MDX pipeline, no redundant parsing, exports `minutesToRead` via frontmatter. |
| React Version | ✅ RESOLVED | **React 19** - Latest stable (Dec 2025), performance improvements, backward compatible. |
| Dev Server Routing | 🔶 OPEN | How should `/blog/*` routes be served during `pnpm run dev`? See [research.md](./research.md) Question 5. |

## Development Mode Architecture

**Requirements**: FR-017 (dev mode routing), FR-018 (HMR for MDX)

### Problem Statement

The landing page uses `index.html` as its entry point. When running `pnpm run dev`, Vite serves this file for `/`. However, blog routes (`/blog/*`) need to render the React blog application, not the landing page.

### Architecture Options

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| **A. Custom middleware** | Vite plugin intercepts `/blog/*` and serves `blog-dev.html` | Works immediately; dev-only code | Not standard Vite pattern; extra file to maintain |
| **B. Vite MPA config** | Add `blog/index.html` to rollupOptions.input | Standard Vite multi-page approach | Requires physical HTML file per entry; doesn't handle `/blog/<slug>` dynamically |
| **C. Vite appType: 'spa' + historyApiFallback** | Configure fallback for `/blog/*` to blog entry | Standard SPA pattern | Conflicts with landing page; would need separate configs |
| **D. Dev-time prerender** | Generate HTML files on MDX change during dev | Matches production exactly | Slow iteration; defeats HMR purpose |

**Decision**: 🔶 PENDING - See [research.md](./research.md) Question 5

### HMR Behavior

**Requirement**: FR-018 - MDX changes trigger hot reload without full page refresh.

**Implementation**:
- `@mdx-js/rollup` provides HMR support for MDX files
- Vite's `server.watch` configured to include `blog/` directory
- React Fast Refresh handles component updates

**Status**: Partially implemented via vite.config.mjs `server.watch.ignored` pattern.

### Production vs Development

| Aspect | Development (`pnpm run dev`) | Production (`pnpm run build`) |
|--------|------------------------------|-------------------------------|
| Routing | Vite dev server + middleware/config | Static HTML files from prerender |
| MDX Compilation | On-demand via @mdx-js/rollup | Build-time via prerender script |
| React Hydration | Full client-side render | SSG HTML + client hydration |
| Assets | Vite dev server serves from source | Optimized, hashed, in dist/ |
