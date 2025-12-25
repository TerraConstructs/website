# Research & Recommendations: Static MDX Blog

**Branch**: `001-static-mdx-blog` | **Date**: 2025-12-18 | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

This document summarizes research findings for the open questions identified in the implementation plan. It provides recommendations and up-to-date technical guidance for building the static MDX blog.

## 1. Executive Summary

Research confirms the original tech stack is sound, with minor version updates and clearer implementation paths for open questions. React 19 is now stable and recommended. For Static Site Generation (SSG), a custom prerendering script using Vite's API offers the most control and least complexity. For image optimization, a combination of two plugins is recommended. For reading time, `remark-reading-time` is the ideal solution.

## 2. Technology Updates

Based on current information (Dec 2025), the following updates should be applied to the technical plan.

| Technology | `tech.md` Version | Recommended Version | Rationale |
|------------|-------------------|---------------------|-----------|
| **React**  | 18                | **19.x**            | React 19 is the latest stable release, offering performance improvements, a new compiler, and an Actions API that could be useful for future interactive features. It's backward-compatible for this project's needs. |

## 3. Open Question: SSG Strategy

**Question**: Use `vite-plugin-ssr` (now Vike), `VitePress`, or a custom prerender script?

**Analysis**:
*   **Vike (formerly `vite-plugin-ssr`)**: A powerful, file-based routing framework. It is excellent for complex applications needing both SSR and SSG, but its conventions and abstractions add a learning curve and maintenance overhead not justified for a simple static blog.
*   **VitePress**: Opinionated and tailored for documentation sites. While fast and simple, its conventions are rigid and may conflict with the desire to keep the blog as a sub-path of the main website rather than a standalone entity.
*   **`vite-plugin-press`**: A modular plugin from ServiceStack for adding Markdown/MDX-based content to an existing Vite app. While it simplifies the initial setup, it introduces a high-level abstraction over the remark/rehype pipeline. This project requires fine-grained control for custom plugins (reading time, TOC extraction) and Shiki transformers (line highlighting), making this plugin too restrictive.
    *   **Technical Blocker 1: Virtual Module Barrier**: The plugin stores data in `virtual:press`, which exists only in Vite's memory. Accessing this from a standard Node.js prerender script is difficult and fragile.
    *   **Technical Blocker 2: Double Parse Inefficiency**: The plugin reads files as strings for metadata. To get TOC and Shiki HTML, we would have to run a second `@mdx-js/rollup` pipeline, parsing every file twice.
*   **Custom Prerender Script**: A Node.js script that uses Vite's own build API (`vite.build()`) and `render` function from the React entry point (`src/blog/index.tsx`). This approach offers maximum control, zero new framework dependencies, and aligns perfectly with the project goal of extending an existing Vite project.

**Recommendation**: **Adopt a custom prerender script.**

This script will:
1.  Read the `blog/` directory to find all `index.mdx` files.
2.  For each post, call `vite.build()` with a temporary entry point to generate the HTML and assets.
3.  Generate the main `blog/index.html` listing page.
4.  This provides a clear, dependency-free path to SSG that is easy to debug and maintain.

### Where `vite-plugin-press` Excels

Despite not being the recommended solution for this project due to its lack of customizability, it's important to highlight the strengths of `vite-plugin-press` and its intended use case. This analysis confirms it is a powerful tool for the right job.

`vite-plugin-press` is ideal for:

*   **Rapid Content Integration:** Its primary strength is quickly adding feature-rich, conventional content sections (like blogs, video libraries, or "What's New" pages) to an existing Vite application, especially within the [ServiceStack](https://servicestack.net/) ecosystem.
*   **Zero-Configuration Features:** It provides several valuable features out-of-the-box with no configuration required. As discovered during the source code review, it automatically calculates **reading time** (`minutesToRead`) and handles rich **author metadata**, which were specific functional requirements of this project.
*   **Structured Content Types:** The plugin is opinionated about content structure, offering predefined types for `Post`, `Video`, `WhatsNew`, and `Author`. If a project's content model aligns with these types, the plugin provides a significant head start by handling data parsing and aggregation automatically.
*   **Simplified Data Access:** It exposes all processed content and metadata through a clean `virtual:press` module, making it trivial to access lists of posts, authors, or tags from within React components without needing to write complex data-loading logic.

In summary, `vite-plugin-press` is an excellent choice for developers who want to add standard, content-driven features to a Vite app without needing to build a custom markdown pipeline. It prioritizes convention over configuration, which accelerates development for projects that fit its model. For this project, however, the need for deep customization (TOC generation, custom Shiki themes, interactive code blocks) makes a manual pipeline the more appropriate choice.

## 4. Open Question: Image Optimization

**Question**: Use `vite-imagetools` vs. another solution?

**Analysis**:
*   **`vite-plugin-imagetools`**: Excellent for generating multiple sizes and formats of an image on-demand via URL queries (e.g., `?w=400&format=webp`). It is ideal for creating responsive `srcset` attributes.
*   **`vite-plugin-image-optimizer`**: Focused on compressing all image assets during the build to reduce their file size. It applies optimizations globally.

These tools are not mutually exclusive; they serve complementary purposes.

**Recommendation**: **Use both plugins.**
1.  **`vite-plugin-image-optimizer`**: To automatically compress all static images (e.g., in `public/` and co-located with posts).
2.  **`vite-plugin-imagetools`**: To be used specifically within React components when responsive images (`<picture>` or `img srcset`) are required, allowing fine-grained control over variants.

## 5. Open Question: Reading Time Calculation

**Question**: Calculate in a Vite plugin or a remark plugin?

**Analysis**:
*   **Vite Plugin**: Would require reading and parsing the MDX file content within the plugin, which is redundant as the remark/rehype pipeline already does this.
*   **`remark-reading-time`**: A dedicated remark plugin that hooks directly into the MDX compilation process. It calculates reading time and can export it as part of the MDX module's metadata.

**Recommendation**: **Use `remark-reading-time`.**

It integrates cleanly into the MDX plugin chain. The calculated reading time can be exposed via `remark-mdx-frontmatter` and consumed directly by the React components.

## 6. Implementation Details & Best Practices

### MDX / Rehype / Shiki Pipeline

The `tech.md` document outlines a solid plugin chain. Based on current best practices, the recommended `vite.config.mjs` setup is:

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mdx from '@mdx-js/rollup';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeShiki from '@shikijs/rehype';
import remarkReadingTime from 'remark-reading-time';

export default defineConfig({
  plugins: [
    react(),
    mdx({
      remarkPlugins: [
        remarkFrontmatter,
        remarkMdxFrontmatter,
        remarkReadingTime
      ],
      rehypePlugins: [
        rehypeSlug,
        [rehypeAutolinkHeadings, { behavior: 'wrap' }],
        [rehypeShiki, {
          themes: {
            light: 'github-light',
            dark: 'github-dark',
          },
          // Add transformers for line highlighting, etc.
        }],
      ],
    }),
  ],
});
```
**Note**: `rehype-autolink-headings` is added for better anchor link accessibility on headings. `@shikijs/rehype` is the modern choice over `rehype-shiki`.

### Fuse.js Client-Side Search

The setup in a React component is straightforward using `useState` and `useMemo`.

1.  **Generate Index**: The custom prerender script will be responsible for generating a `search-index.json` file by collecting titles, excerpts, and tags from all blog posts.
2.  **React Hook**: A `useSearch` hook can encapsulate the logic.

```javascript
// hooks/useSearch.ts
import { useState, useMemo } from 'react';
import Fuse from 'fuse.js';

// The search index would be fetched once and passed into this hook
export function useSearch(searchIndex, options) {
  const [query, setQuery] = useState('');

  const fuse = useMemo(() => new Fuse(searchIndex, options), [searchIndex, options]);

  const results = useMemo(() => {
    if (!query) return []; // Or return all items
    return fuse.search(query);
  }, [fuse, query]);

  return { query, setQuery, results };
}
```

## 7. Alternative Framework Analysis

While the analysis has focused on `vite-plugin-press` and a custom script, it's worth evaluating other popular frameworks against the project's core constraints: **minimal**, **blog-focused**, and **fits the existing Vite + React stack**.

### Monolithic Frameworks (Astro, Next.js)

Frameworks like Astro and Next.js are powerful, first-class solutions for building content-driven sites with MDX.

*   **Astro:** A content-focused framework known for its "Islands Architecture" that ships minimal JavaScript. While it uses Vite internally, it is a self-contained ecosystem. Adopting it would mean migrating the *entire existing site* into Astro's project structure, which violates the "extend, don't replace" nature of this project.
*   **Next.js:** A full-stack React framework with its own build system (Webpack/Turbopack). It is fundamentally incompatible with the existing Vite build pipeline.

**Aptitude Evaluation:** Both are inappropriate for this project because they are not "minimal plugins" but complete frameworks that would necessitate a full site migration, conflicting with the core technical requirement of extending the current Vite application.

### Vite-Native Frameworks (Vike)

A more relevant alternative is a framework designed to work *with* Vite.

*   **Vike (formerly `vite-plugin-ssr`):** A minimal, Vite-native framework that provides file-system-based routing and a structured approach for rendering pages (SSR or SSG). Unlike Astro or Next.js, it is a rendering *plugin* for Vite, not a replacement.

*   **Aptitude Evaluation:**
    *   **Fit for Stack:** Excellent. It is designed to be used *with* Vite, React, and any MDX plugin setup (`@mdx-js/rollup`). The existing MDX configuration would be fully compatible.
    *   **Minimalism:** Very high. It is unopinionated and only handles the routing and rendering layer, providing a thin, flexible layer of control without dictating content structure.
    *   **Comparison to Custom Script:**
        *   **Pros:** Vike offers a formal, documented structure for page creation and data loading (e.g., a `+data.js` file to fetch post metadata). Its file-based routing can be cleaner and more scalable than a custom script that relies on `glob`.
        *   **Cons:** For a project with only two main page templates (the blog index and the post page), Vike's routing system and conventions might be slight overkill compared to a simple 50-line prerender script.
    *   **Conclusion:** Vike is a **highly suitable and technically superior alternative** to the custom script approach. The final decision is a trade-off: the custom script is the most direct solution for the immediate, limited scope, while Vike is the more robust and scalable engineering choice if the blog or other static pages are expected to grow in complexity. Given the project's focus on a single, well-defined feature, the custom script remains the recommendation for its absolute minimalism, but Vike is a very strong second choice.

## 8. Final Recommended Dependency List

| Package | Purpose | Justification |
|---------|---------|---------------|
| `react@19` | UI Runtime | Latest stable version. |
| `react-dom@19` | DOM Renderer | Matches React version. |
| `@mdx-js/rollup` | MDX Compilation | Official Vite/Rollup integration for MDX. |
| `fuse.js` | Fuzzy Search | Lightweight, powerful, and easy to use for client-side search. |
| `shiki`, `@shikijs/rehype` | Syntax Highlighting | Provides VS Code-quality highlighting at build time. `@shikijs/rehype` is the modern integration. |
| `remark-frontmatter` | Frontmatter Parsing | Core MDX ecosystem plugin. |
| `remark-mdx-frontmatter`| Frontmatter Export | Exposes frontmatter data to the React component. |
| `rehype-slug` | Heading IDs | Adds `id` attributes to headings for linking. |
| `rehype-autolink-headings`| Heading Links | Improves accessibility by making headings self-linking. |
| `remark-reading-time` | Reading Time | Solves the reading time requirement cleanly. |
| `vite-plugin-image-optimizer`| Image Compression | Reduces final bundle size by optimizing images. |
| `vite-plugin-imagetools` | Responsive Images | Provides tools for generating `srcset` attributes. |
| `glob` | File Discovery | To be used in the custom prerender script to find all MDX files. |

This research provides a clear path forward for each of the open questions and confirms that the chosen technologies are appropriate and well-supported.

## 9. Hypothetical Extension of `vite-plugin-press`

To provide a complete analysis, it's useful to consider *how* `vite-plugin-press` could be extended to meet this project's specific needs. This highlights the trade-off between its convention-over-configuration approach and the project's requirement for deep customization.

### Feasible Extensions (Post-Processing & Composition)

These are extensions that work *with* the plugin without modifying its source code.

1.  **Search Index Generation (FR-009):** This is the most feasible extension. Because `vite-plugin-press` exposes all processed post data via the `virtual:press` module, one could create a simple, separate Vite plugin that runs *after* `vite-plugin-press`. This secondary plugin would import the data, format it into the required `search-index.json` structure, and use Vite's `emitFile` API to add it to the build output. This is a clean, compositional approach.

2.  **Client-Side Logic (FR-005, FR-007, FR-010):** All purely client-side features are inherently extensible. The data provided by the plugin (tags, author info, etc.) is simply consumed by React components. The implementation of a tag filtering UI, a search bar, or a scroll-spy hook is independent of the plugin's core logic.

### Difficult or Impossible Extensions (Requiring a Fork)

These extensions would require modifying the internal source code of `vite-plugin-press` because its public `Options` API does not provide the necessary hooks.

1.  **TOC Generation (FR-006):** This is impossible without a fork. To generate a Table of Contents, a `rehype` plugin like `rehype-extract-toc` must be injected into the Markdown-to-HTML processing pipeline. The `vite-plugin-press` `Options` interface has no `rehypePlugins` array. A developer would need to fork the repository and manually edit the internal markdown processing logic (likely in files like `src/blog.ts`) to add support for custom rehype plugins.

2.  **Advanced Code Blocks (FR-008, FR-008a,b,c):** This is also impossible without a fork, for several reasons:
    *   **Custom Shiki Themes:** The plugin has no option to configure the syntax highlighter's theme, making it impossible to match the site's design tokens or support dark mode for code blocks.
    *   **Line Highlighting:** This requires Shiki transformers, which, like rehype plugins, cannot be configured via the public API.
    *   **Custom React Components:** Replacing the default `<pre>` element with a custom `<CodeBlock>` component for copy/collapse features requires an MDX component override. The plugin's rendering pipeline would need to be modified to accept and apply these overrides.

**Conclusion on Extensibility:** While `vite-plugin-press` could be wrapped or supplemented with other tools for post-processing tasks, its core processing pipeline is a "black box." Any requirement that needs to hook into the transformation of Markdown to HTML is not supported and would necessitate maintaining a private fork, which carries significant long-term maintenance costs. This reinforces the decision that a custom, transparent pipeline is the correct choice for a project with such specific, advanced functional requirements.

## 10. Functional Requirement Fulfillment Comparison

| Functional Requirement | `vite-plugin-press` Fulfillment | Current Proposal Fulfillment |
|---|---|---|
| **FR-001**: System MUST generate static pages from markdown files with frontmatter | **Yes**. This is a core feature. The plugin processes `.md` / `.mdx` files, parses frontmatter (`title`, `slug`, `date`, `tags`, etc.), and makes content available for rendering. The `Doc` and `Post` types explicitly define frontmatter fields. | **Yes**. The custom prerender script will leverage `@mdx-js/rollup` to compile `.mdx` files and `remark-mdx-frontmatter` to extract metadata. Each post will be prerendered to a static HTML page. |
| **FR-002**: System MUST serve blog posts at `/blog/<slug>` where slug derives from filename or frontmatter | **Yes**. The plugin manages slug generation from file names or frontmatter (`Doc.slug`). It makes this data available, allowing for precise control over the output path within the Vite build process, matching the `/blog/<slug>` requirement. | **Yes**. The custom prerender script has full control over the output directory structure, ensuring files are generated exactly at `dist/blog/[slug]/index.html`. |
| **FR-003**: System MUST render a blog index page at `/blog` listing all published posts | **Yes (Data Provided)**. The plugin aggregates metadata for all posts (`blog.posts` array, containing `title`, `slug`, `summary`, `date`, `tags`, `minutesToRead`, etc.). This data is directly usable within a React component to construct the blog index page. The rendering of the HTML for the index page itself is left to the developer. | **Yes**. The custom prerender script will aggregate metadata from all posts (via `remark-mdx-frontmatter` exports) and pass it as a prop to the blog index component (`src/blog/index.tsx`), which will then be prerendered to `dist/blog/index.html`. |
| **FR-004**: System MUST support multiple tags per post with clickable tag chips | **Yes (Data Provided)**. The `Doc` type explicitly includes `tags: string[]`, meaning the plugin correctly parses and provides tag data from frontmatter. Rendering the tags as clickable chips is a manual React component implementation. | **Yes**. `remark-mdx-frontmatter` will expose the `tags` array from the frontmatter. The `PostCard` and `BlogLayout` React components will be responsible for rendering these tags as clickable chips. |
| **FR-005**: System MUST filter posts by tag on the blog index page (inline filtering, no separate tag pages) | **Manual Implementation**. This is a client-side React logic concern (filtering a list of posts based on selected tag state). `vite-plugin-press` provides the necessary tag data, but the filtering logic itself must be implemented by the developer. | **Manual Implementation**. This is client-side application logic. The `PostList` React component will contain the necessary state management and filtering logic to display posts based on the active tag filter, as specified in the `tech.md`. |
| **FR-006**: System MUST render a floating table of contents for each article on desktop viewports (>=768px) | **No**. This feature requires extracting heading structure at build-time using a rehype plugin (e.g., `rehype-extract-toc`). The `vite-plugin-press` `Options` interface does not expose a way to configure custom remark or rehype plugins, making this functionality impossible to implement through the plugin's configuration. | **Yes**. The proposed MDX pipeline in `vite.config.mjs` explicitly includes `rehype-slug` and `@stefanprobst/rehype-extract-toc` (or similar) to extract the TOC structure. This data will be passed to the `<TOC>` React component for rendering. |
| **FR-006a**: System MUST render TOC as a collapsible drawer on mobile viewports (<768px), hidden by default with an expand button | **No**. As with FR-006, the prerequisite is build-time extraction of TOC data, which `vite-plugin-press` does not support via configuration. Therefore, a mobile TOC is also not feasible through this plugin. | **Yes**. The extracted TOC data will be used by the `<TOCDrawer>` React component, implementing the mobile-specific collapsible drawer UI as specified. |
| **FR-007**: System MUST highlight the active section in TOC based on scroll position | **Manual Implementation**. This is a client-side feature handled by a React hook (e.g., `useScrollSpy` leveraging Intersection Observer) and is entirely independent of any markdown processing plugin. It consumes the TOC data provided by the component. | **Manual Implementation**. A custom `useScrollSpy` hook will be created to track the visible section of the article and update the `activeId` state of the `<TOC>` components, thereby highlighting the current section. |
| **FR-008**: System MUST apply syntax highlighting to code blocks matching landing page theme | **Uncertain (Likely Default Only)**. The plugin does not expose explicit configuration for syntax highlighting or for integrating custom Shiki themes. It likely uses a default syntax highlighter internally. Therefore, matching the specific landing page theme (including light/dark mode variations) is improbable without deep internal modifications or custom overrides not supported by the plugin's API. | **Yes**. The proposal uses `@shikijs/rehype` directly, which allows providing multiple themes (e.g., `github-light`, `github-dark`) via the `themes` option. This ensures perfect matching of the landing page's light and dark mode theme. |
| **FR-008a**: System MUST support line range highlighting in code blocks (e.g., highlight lines 5-10) | **No**. This requires advanced Shiki transformers (e.g., `@shikijs/transformers`) configured within the rehype pipeline. Since `vite-plugin-press` does not expose configuration for rehype plugins or Shiki transformers, this feature cannot be implemented. | **Yes**. The proposal explicitly includes `@shikijs/transformers` within the `@shikijs/rehype` configuration to enable line range highlighting, focusing, and other rich code block features. |
| **FR-008b**: System MUST provide a copy-to-clipboard button on code blocks | **No**. This feature typically requires wrapping highlighted code blocks in a custom React component (e.g., `<CodeBlock>`) that adds the button. `vite-plugin-press` does not provide an API for overriding how code blocks are rendered or for injecting custom React components to wrap generated HTML elements. | **Yes**. The plan includes a custom `<CodeBlock>` React component that wraps the Shiki-generated HTML. This component will implement the copy-to-clipboard functionality and other interactive features. |
| **FR-008c**: System MUST support expandable/collapsible code sections for long examples | **No**. Similar to FR-008b, this requires a custom React component (`<CodeBlock>`) to provide the interactive toggle for long code examples. `vite-plugin-press` lacks the necessary extension points to inject such component overrides for specific HTML elements. | **Yes**. The custom `<CodeBlock>` React component will detect long code blocks and provide an expandable/collapsible UI, meeting this functional requirement. |
| **FR-009**: System MUST generate a search index at build time | **Yes (Data Provided)**. The plugin provides all necessary post metadata, including `content`, `title`, `summary`, and `tags` via the `blog.posts` array. This data can be harvested by a separate build script after the plugin has run to construct a Fuse.js search index. The plugin itself does not output the `search-index.json` file. | **Yes**. The custom prerender script will explicitly iterate through all processed MDX files, extract their full content and frontmatter, and then generate a comprehensive `search-index.json` file for Fuse.js at build time. |
| **FR-010**: System MUST provide client-side search with instant results as user types | **Manual Implementation**. This is a client-side React component concern using Fuse.js and involves state management. `vite-plugin-press` provides the data for the search index, but the search UI and logic must be implemented by the developer. | **Manual Implementation**. A `useSearch` hook will be implemented in React, leveraging `fuse.js` to provide instant, fuzzy search results based on the pre-generated `search-index.json` file. |
| **FR-011**: System MUST support dark mode matching the landing page theme toggle | **Partially**. While general dark mode theming is handled by CSS (e.g., Tailwind), the critical part of this FR for blog content is ensuring syntax highlighting also respects dark mode. Since `vite-plugin-press` doesn't expose Shiki theme configuration (FR-008), full dark mode consistency for code blocks is not possible. | **Yes**. The proposed stack ensures full dark mode support, including the crucial aspect of syntax highlighting, by configuring `@shikijs/rehype` with both light and dark themes, which are then dynamically applied based on the site's theme toggle. |
| **FR-012**: System MUST display reading time estimate on post cards and article pages | **Yes**. The `Doc` type explicitly includes `minutesToRead: number` and `wordCount: number`. This indicates that `vite-plugin-press` performs reading time calculation internally and exposes this data in the post metadata. | **Yes**. The proposed MDX pipeline in `vite.config.mjs` explicitly includes `remark-reading-time`, which calculates the reading time and exposes it via frontmatter for use in React components. |
| **FR-013**: System MUST support embedded images and assets co-located with post files | **Yes**. As a Vite plugin, it will leverage Vite's native asset handling capabilities. Relative image paths within markdown (`![alt](./image.png)`) are expected to resolve correctly. The `Post` type includes an `image` field. | **Yes**. This is handled natively by Vite and the MDX/rollup integration. The `vite-plugin-image-optimizer` and `vite-plugin-imagetools` plugins will further enhance image handling. |
| **FR-014**: System MUST preserve responsive design patterns from the landing page (310px-1920px) | **Manual Implementation**. This is entirely a CSS and responsive component design concern. `vite-plugin-press` processes content, but does not dictate or influence the responsive styling of the application. | **Manual Implementation**. All new React components for the blog will be built mobile-first, utilizing the existing Tailwind CSS configuration to ensure responsive design patterns are preserved and consistent with the landing page. |
| **FR-015**: System MUST display author name as plain text byline on blog posts | **Yes (Data Provided)**. The `Post` type includes `author: string`, and `Author` data is also exposed (`blog.authors`). This provides all necessary data to render an author byline in a React component. | **Yes**. The `author` field from the frontmatter is exposed via `remark-mdx-frontmatter` and rendered by the appropriate React component responsible for the post layout. |
| **FR-016**: System MUST provide a `<SeriesNav>` component for linking related posts in a multi-part series | **Yes (MDX Support)**. Since `vite-plugin-press` uses MDX, it supports the fundamental capability of embedding and using custom React components (like `<SeriesNav>`) directly within `.mdx` files. The `components` object in `VirtualPress` also suggests this. | **Yes**. As a standard feature of MDX, custom React components like `<SeriesNav>` can be imported and used directly in the blog post content, allowing authors to define and link series parts within their MDX files. |