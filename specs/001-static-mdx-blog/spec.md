# Feature Specification: Static MDX Blog

**Feature Branch**: `001-static-mdx-blog`
**Created**: 2025-12-18
**Status**: Draft
**Input**: User description: "Static MDX blog with build-time generation, tag-based navigation, floating TOC, and search"

## Clarifications

### Session 2025-12-18

- Q: What directory structure should blog posts use? → A: Nested by slug (e.g., `blog/my-post/index.mdx`) with date in frontmatter
- Q: How should the floating TOC behave on mobile viewports (<768px)? → A: Collapsible drawer, hidden by default, expandable via button
- Q: Should blog support draft posts excluded from production builds? → A: No drafts; all files in blog directory are published (use git branches for WIP)
- Q: Should tag navigation use separate pages or inline filtering? → A: Inline filtering on `/blog` page with URL hash for shareability
- Q: Should blog support multi-part series? → A: Use tags for series grouping + React component for in-post series navigation (readers can track/jump between parts)
- Q: Should posts display author attribution? → A: Yes, `author` frontmatter field; displayed as plain text byline on posts (future: richer author profiles)
- Q: What level of interactivity for code demos? → A: Shiki syntax highlighting (build-time) + client JS for expandable details, copy button, and line range highlighting

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Read a Blog Post (Priority: P1)

A visitor discovers a TerraConstructs blog post through search or direct link and reads it to learn about infrastructure-as-code topics.

**Why this priority**: Core value proposition - without readable posts, the blog has no purpose.

**Independent Test**: Navigate to any blog post URL and verify the content renders with proper formatting, syntax highlighting, and navigation aids.

**Acceptance Scenarios**:

1. **Given** a published blog post exists, **When** a visitor navigates to `/blog/<slug>`, **Then** the full article renders with formatted content, syntax-highlighted code blocks, and a floating table of contents.
2. **Given** a visitor is reading a long article, **When** they scroll through sections, **Then** the table of contents highlights the currently visible section.
3. **Given** a post contains code examples, **When** the page loads, **Then** syntax highlighting matches the landing page color scheme (both light and dark modes).

---

### User Story 2 - Browse Blog by Tags (Priority: P2)

A visitor wants to explore related content by filtering posts based on topics of interest.

**Why this priority**: Enables content discovery and increases engagement beyond single-post visits.

**Independent Test**: Click a tag and verify only posts with that tag appear in the filtered view on the blog index.

**Acceptance Scenarios**:

1. **Given** posts are tagged with categories, **When** a visitor clicks a tag chip, **Then** the blog index filters to show only posts with that tag.
2. **Given** a visitor has filtered by tag, **When** they view the results, **Then** filtered posts display title, date, excerpt, and all associated tags.
3. **Given** a post has multiple tags, **When** displayed anywhere in the blog, **Then** all tags are visible and clickable.
4. **Given** a visitor has filtered by tag, **When** they want to share the view, **Then** the URL reflects the active filter (e.g., `/blog#tag=aws`).

---

### User Story 3 - Search for Content (Priority: P2)

A visitor wants to quickly find specific topics or posts without browsing through all content.

**Why this priority**: Critical for larger blogs; enables visitors to find relevant content immediately.

**Independent Test**: Type a search query and verify matching posts appear instantly without page reload.

**Acceptance Scenarios**:

1. **Given** the blog has multiple posts, **When** a visitor types in the search field, **Then** matching results appear as they type (instant feedback).
2. **Given** a search query matches post titles or content, **When** results display, **Then** each result shows the post title, excerpt with highlighted match, and publication date.
3. **Given** no posts match a search query, **When** results are empty, **Then** a helpful "no results" message appears with suggestions.

---

### User Story 4 - Browse All Posts (Priority: P3)

A visitor wants to see all available blog content to understand the breadth of topics covered.

**Why this priority**: Provides overview and alternative discovery path for visitors who prefer browsing.

**Independent Test**: Navigate to `/blog` and verify all published posts appear in chronological order.

**Acceptance Scenarios**:

1. **Given** multiple blog posts exist, **When** a visitor navigates to `/blog`, **Then** a listing page shows all posts sorted by publication date (newest first).
2. **Given** the blog listing page, **When** viewing post cards, **Then** each displays title, date, excerpt, tags, and estimated reading time.

---

### User Story 5 - Author Adds New Post (Priority: P1)

A content author creates a new blog post by adding a file to the repository.

**Why this priority**: Core authoring workflow - must be simple and reliable for adoption.

**Independent Test**: Create a new markdown file with frontmatter, run the build, and verify the post appears on the blog.

**Acceptance Scenarios**:

1. **Given** an author creates a new markdown file with valid frontmatter, **When** the site builds, **Then** a new page is generated at `/blog/<slug>`.
2. **Given** an author specifies title, date, tags, and excerpt in frontmatter, **When** the post renders, **Then** all metadata displays correctly.
3. **Given** an author includes images in the post directory, **When** referenced in markdown, **Then** images render correctly in the built page.
4. **Given** an author is editing a blog post, **When** they run `pnpm run dev` and navigate to `/blog/<slug>`, **Then** they see a live preview of the post with full formatting and syntax highlighting.
5. **Given** an author modifies MDX content while dev server is running, **When** they save the file, **Then** the browser updates without full page refresh (HMR).

---

### User Story 6 - Navigate Multi-Part Series (Priority: P2)

A visitor reading part of a series wants to navigate to other parts without returning to the blog index.

**Why this priority**: Enables seamless reading experience for long-form content split across posts.

**Independent Test**: Open a series post and verify the series navigation component shows all parts with current position highlighted.

**Acceptance Scenarios**:

1. **Given** a post uses the `<SeriesNav>` component, **When** the page loads, **Then** a navigation element displays all parts of the series with titles and links.
2. **Given** a visitor is viewing part 2 of a 4-part series, **When** viewing the series nav, **Then** part 2 is visually highlighted as the current post.
3. **Given** a visitor clicks another part in the series nav, **When** navigating, **Then** they are taken directly to that post.

---

### Edge Cases

- What happens when a visitor navigates to a non-existent blog slug? Display a styled 404 page with navigation back to blog index.
- What happens when a tag has no associated posts? Empty tags are not displayed in the tag filter UI.
- What happens when search index is unavailable? Gracefully hide search or show "search unavailable" message.
- What happens when a post has no tags? Post appears in main listing but not in any tag views (by design).
- What happens when frontmatter is malformed? Build fails with clear error message indicating the problematic file.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST generate static pages from markdown files with frontmatter
- **FR-002**: System MUST serve blog posts at `/blog/<slug>` where slug derives from filename or frontmatter
- **FR-003**: System MUST render a blog index page at `/blog` listing all published posts
- **FR-004**: System MUST support multiple tags per post with clickable tag chips
- **FR-005**: System MUST filter posts by tag on the blog index page (inline filtering, no separate tag pages)
- **FR-006**: System MUST render a floating table of contents for each article on desktop viewports (>=768px)
- **FR-006a**: System MUST render TOC as a collapsible drawer on mobile viewports (<768px), hidden by default with an expand button
- **FR-007**: System MUST highlight the active section in TOC based on scroll position
- **FR-008**: System MUST apply syntax highlighting to code blocks matching landing page theme
- **FR-008a**: System MUST support line range highlighting in code blocks (e.g., highlight lines 5-10)
- **FR-008b**: System MUST provide a copy-to-clipboard button on code blocks
- **FR-008c**: System MUST support expandable/collapsible code sections for long examples
- **FR-009**: System MUST generate a search index at build time
- **FR-010**: System MUST provide client-side search with instant results as user types
- **FR-011**: System MUST support dark mode matching the landing page theme toggle
- **FR-012**: System MUST display reading time estimate on post cards and article pages
- **FR-013**: System MUST support embedded images and assets co-located with post files
- **FR-014**: System MUST preserve responsive design patterns from the landing page (310px-1920px)
- **FR-015**: System MUST display author name as plain text byline on blog posts
- **FR-016**: System MUST provide a `<SeriesNav>` component for linking related posts in a multi-part series
- **FR-017**: System MUST serve blog posts at `/blog/<slug>` during development (`pnpm run dev`) with live preview
- **FR-018**: System MUST support hot module replacement for MDX file changes in development mode

### Content Directory Structure

Posts use a nested-by-slug structure with co-located assets:

```
blog/
├── getting-started/
│   ├── index.mdx
│   └── diagram.png
├── advanced-patterns/
│   ├── index.mdx
│   └── screenshot.jpg
└── ...
```

Each post folder contains an `index.mdx` file and any associated assets (images, code snippets). The folder name becomes the URL slug unless overridden in frontmatter.

### Required Frontmatter Fields

- **title**: Post title (required)
- **date**: Publication date in ISO format (required)
- **author**: Author name for byline display (required)
- **slug**: URL slug, defaults to folder name if omitted (optional)
- **tags**: Array of tag strings (optional, defaults to empty)
- **excerpt**: Short description for listings and SEO (optional, auto-generated from first paragraph if omitted)

### Key Entities

- **Post**: Title, slug, date, tags, excerpt, content, reading time, table of contents structure
- **Tag**: Name, slug, associated post count
- **Search Index**: Pre-built index of post titles, content, and metadata for client-side search
- **Table of Contents Entry**: Heading text, level (h2/h3), anchor ID, nesting relationship

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Blog pages load in under 2 seconds on 3G connection (initial paint)
- **SC-002**: Search returns results in under 100ms after typing stops
- **SC-003**: 100% of blog posts pass accessibility audit (WCAG 2.1 AA)
- **SC-004**: Authors can publish a new post in under 5 minutes (file creation to live)
- **SC-005**: TOC scroll tracking updates within 50ms of section visibility change
- **SC-006**: Blog index supports 100+ posts without pagination performance issues
- **SC-007**: Site maintains Lighthouse score of 90+ across all blog pages

### Previous work

No prior related features in the beads issue tracker.

## Assumptions

- Authors have git access and can commit markdown files to the repository
- The existing build system will be extended (not replaced) to support blog generation
- Blog styling will reuse existing design tokens and color schemes
- No user authentication or comments system required (static content only)
- Posts are not draft-aware; all files in the blog directory are published (use git branches for work-in-progress)
- RSS feed generation is out of scope for initial implementation
- Pagination of blog index is out of scope (acceptable for up to 100 posts)
