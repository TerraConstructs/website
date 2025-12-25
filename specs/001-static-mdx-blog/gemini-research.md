# ADR: Build Pipeline Architecture & Dependency Selection

**Branch**: `001-static-mdx-blog` | **Date**: 2025-12-18
**Status**: **DECIDED & FINAL**

## Context
The project requires a **Static Site Generation (SSG)** workflow to build a blog with the following constraints:
1.  **Static HTML Output**: Must generate `/blog/slug/index.html`.
2.  **Advanced Features**: Requires build-time Table of Contents (TOC) extraction and Shiki syntax highlighting (VS Code style).
3.  **Minimalism**: Must fit the existing Vite + React stack without unnecessary abstractions.

We evaluated `vite-plugin-press` (a ServiceStack ecosystem plugin) and **VitePress** against a "Pure" Vite + MDX + React 19 pipeline.

## The Decision: Pure Vite + MDX + React 19
**We will NOT use `vite-plugin-press` or VitePress.**
We will implement a **Custom Prerender Script** using standard Node.js libraries (`glob`, `fs`) and the `@mdx-js/rollup` pipeline.

## Detailed Rationale for Rejection

### 1. Rejection of `vite-plugin-press`
While `vite-plugin-press` is excellent for Client-Side SPAs, it introduces fatal architectural conflicts for an SSG workflow:
*   **The Virtual Module Barrier**: The plugin stores its data in a "Virtual Module" (`virtual:press`) that exists only in Vite's memory. A standard Node.js prerender script cannot import this without spinning up a full programmatically controlled Vite server, which is slow and fragile.
*   **The Double Parse Inefficiency**: The plugin reads files as plain text for metadata. To get TOC and Shiki HTML, we would still need to set up a separate `@mdx-js/rollup` pipeline. Every file would be parsed twice—once for metadata and once for rendering.
*   **Black Box Pipeline**: The plugin does not expose its internal Rehype/Remark pipeline. We cannot inject `rehype-extract-toc` or Shiki transformers without forking the plugin itself.

### 2. Rejection of VitePress
*   **Framework Mismatch**: VitePress is a Vue-based framework. Adopting it would force us to maintain two parallel UI frameworks (React for the site, Vue for the blog) and two separate build pipelines, violating the core constraint of "fitting the existing Vite + React stack."

## Functional Requirement Fulfillment: Comparison

| Functional Requirement | VitePress / `vite-plugin-press` Fulfillment | Current Proposal (React 19 + Custom SSG) |
| :--- | :--- | :--- |
| **FR-001: Static Generation** | **VitePress**: ✅ Native.<br>**Plugin**: ❌ Requires workaround for SSG. | ✅ **Direct**. Custom script uses `react-dom/static` `prerender` API for clean HTML generation. |
| **FR-002: /blog/slug URLs** | ✅ Native in both. | ✅ **Direct**. Prerender script controls directory structure output. |
| **FR-003: Blog Index** | ✅ Native in both. | ✅ **Custom**. React component renders `blog/index.html` using metadata extracted via `remark-frontmatter`. |
| **FR-004: Tag Chips** | ✅ Supported. | ✅ **Custom**. Flexible React chips with state-based filtering. |
| **FR-005: Tag Filtering** | ✅ Supported. | ✅ **Native React**. Client-side state filtering with URL hash persistence (`#tag=aws`). |
| **FR-006: Floating TOC (Desktop)** | **VitePress**: ✅ Native.<br>**Plugin**: ❌ Impossible without fork. | ✅ **Custom**. `rehype-extract-toc` extracts structure; React `TOC.tsx` renders it. |
| **FR-006a: TOC Drawer (Mobile)** | **VitePress**: ✅ Native.<br>**Plugin**: ❌ Impossible. | ✅ **Custom**. React `TOCDrawer.tsx` uses shared CSS/JS logic. |
| **FR-007: TOC Scroll Spy** | **VitePress**: ✅ Native.<br>**Plugin**: ❌ Impossible. | ✅ **Custom**. `useScrollSpy` hook leverages Intersection Observer API for performance. |
| **FR-008: Syntax Highlighting** | ✅ Native (Shiki) in both. | ✅ **Integrated**. `@shikijs/rehype` in the MDX pipeline. No extra runtime JS. |
| **FR-008a: Line Highlighting** | **VitePress**: ✅ Native.<br>**Plugin**: ❌ Impossible. | ✅ **Advanced**. `@shikijs/transformers` added to rehype pipeline for `{5-10}` support. |
| **FR-008b: Copy Button** | **VitePress**: ✅ Native.<br>**Plugin**: ❌ Impossible. | ✅ **Integrated**. React `<CodeBlock>` component replaces `<pre>` via MDX provider. |
| **FR-008c: Collapsible Code** | ❌ Not native in either. | ✅ **Custom**. React `<CodeBlock>` handles state for code block height. |
| **FR-009: Search Index** | ✅ Native in both. | ✅ **Build-time**. Script generates `search-index.json` from extracted MDX content. |
| **FR-010: Client Search** | ✅ Native in both. | ✅ **Custom**. `Fuse.js` provides typo-tolerant fuzzy matching in a React modal. |
| **FR-011: Dark Mode** | ✅ Native in both. | ✅ **Perfect Sync**. Directly inherits landing page theme toggle and Tailwind dark classes. |
| **FR-012: Reading Time** | ✅ Native in both. | ✅ **Direct**. `remark-reading-time` calculates this during the single-pass build. |
| **FR-016: Series Nav** | ❌ Not native. | ✅ **Custom**. React `<SeriesNav>` component embedded directly in MDX content. |

## Conclusion
The **Custom React 19 + MDX Pipeline** is the only path that meets 100% of the functional requirements while respecting the project's strict minimalism and technology constraints. It eliminates the "black box" limitations of plugins and avoids the maintenance burden of a dual-framework architecture.
