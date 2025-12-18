# Tasks Index: Static MDX Blog

Beads Issue Graph Index into the tasks and phases for this feature implementation.
This index does **not contain tasks directly**—those are fully managed through Beads CLI.

## Feature Tracking

* **Beads Epic ID**: `website-86d`
* **User Stories Source**: `specs/001-static-mdx-blog/spec.md`
* **Research Inputs**: `specs/001-static-mdx-blog/research.md`
* **Planning Details**: `specs/001-static-mdx-blog/plan.md`
* **Data Model**: `specs/001-static-mdx-blog/data-model.md`

## Beads Query Hints

Use the `bd` CLI to query and manipulate the issue graph:

```bash
# Find all open tasks for this feature
bd list --label spec:001-static-mdx-blog --status open --limit 10

# Find ready tasks to implement
bd ready --label spec:001-static-mdx-blog --limit 5

# See dependencies for issue
bd dep tree website-86d

# View issues by component
bd list --label 'component:blog' --label 'spec:001-static-mdx-blog' --limit 5

# Show all phases (features)
bd list --type feature --label 'spec:001-static-mdx-blog'

# View tasks for a specific user story
bd list --label 'story:US1' --label 'spec:001-static-mdx-blog'
```

## Tasks and Phases Structure

This feature follows Beads' 2-level graph structure:

* **Epic**: `website-86d` → Static MDX Blog (full feature)
* **Phases**: 9 features (child of the epic):
  * Phase 1: Setup (`website-c8b`) - P1
  * Phase 2: Foundational (`website-ck4`) - P1
  * Phase 3: US1 - Read Blog Post (`website-rse`) - P1 🎯 MVP
  * Phase 4: US5 - Author Adds Post (`website-0am`) - P1 🎯 MVP
  * Phase 5: US2 - Browse by Tags (`website-6x5`) - P2
  * Phase 6: US3 - Search Content (`website-0fj`) - P2
  * Phase 7: US6 - Series Navigation (`website-k32`) - P2
  * Phase 8: US4 - Browse All Posts (`website-3xm`) - P3
  * Phase 9: Polish (`website-2nm`) - P3
* **Tasks**: 45 issues of type `task`, children of each feature

## Convention Summary

| Type    | Description                  | Labels                                     |
| ------- | ---------------------------- | ------------------------------------------ |
| epic    | Full feature epic            | `spec:001-static-mdx-blog`, `component:blog` |
| feature | Implementation phase / story | `phase:<name>`, `story:US#`                |
| task    | Implementation task          | `component:<x>`, `requirement:FR-###`      |

## Phase Overview

### Phase 1: Setup (8 tasks) - Priority P1

**Purpose**: Project initialization and shared infrastructure

```bash
bd list --label 'phase:setup' --label 'spec:001-static-mdx-blog' --type task
```

Key tasks:
- Install React 19 and MDX dependencies
- Install MDX pipeline plugins (remark/rehype)
- Install Shiki syntax highlighting
- Install Fuse.js for search
- Install image optimization plugins
- Create blog directory structure
- Create TypeScript type definitions
- Configure Vite for multi-entry build
- Create sample blog post

**Checkpoint**: All dependencies installed, Vite configured, directory structure ready

---

### Phase 2: Foundational (6 tasks) - Priority P1

**Purpose**: Core infrastructure that MUST complete before user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

```bash
bd list --label 'phase:foundational' --label 'spec:001-static-mdx-blog' --type task
```

Key tasks:
- Create custom Shiki theme matching landing page
- Create prerender script for static HTML generation
- Create BlogLayout component
- Create theme utilities for dark mode
- Implement frontmatter validation

**Checkpoint**: Foundation ready - user story implementation can begin

---

### Phase 3: User Story 1 - Read a Blog Post (8 tasks) - Priority P1 🎯 MVP

**Goal**: Visitors can read blog posts with proper formatting, syntax highlighting, and TOC navigation

**Independent Test**: Navigate to `/blog/<slug>` and verify content renders with TOC and highlighted code

```bash
bd list --label 'story:US1' --label 'spec:001-static-mdx-blog' --type task
```

Key tasks:
- Create CodeBlock component with copy button
- Create TOC component for desktop
- Create TOCDrawer component for mobile
- Create useScrollSpy hook
- Create PostPage component
- Configure Shiki line highlighting
- Integrate prerender with PostPage

**Checkpoint**: Individual blog posts render correctly with all features

---

### Phase 4: User Story 5 - Author Adds New Post (4 tasks) - Priority P1 🎯 MVP

**Goal**: Authors can create posts by adding MDX files with frontmatter

**Independent Test**: Create new MDX file, run build, verify post appears

```bash
bd list --label 'story:US5' --label 'spec:001-static-mdx-blog' --type task
```

Key tasks:
- Configure image handling for co-located assets
- Implement auto-excerpt generation
- Generate SEO meta tags from frontmatter
- Add development HMR for blog content

**Checkpoint**: Complete authoring workflow functional

---

### Phase 5: User Story 2 - Browse by Tags (4 tasks) - Priority P2

**Goal**: Visitors can filter posts by clicking tag chips

**Independent Test**: Click a tag and verify filtered results

```bash
bd list --label 'story:US2' --label 'spec:001-static-mdx-blog' --type task
```

Key tasks:
- Create TagFilter component
- Aggregate tags from all posts
- Implement URL hash sync for tag filter
- Add clickable tags to PostCard

**Checkpoint**: Tag filtering works with shareable URLs

---

### Phase 6: User Story 3 - Search for Content (4 tasks) - Priority P2

**Goal**: Visitors can search posts with instant fuzzy search results

**Independent Test**: Type a query and verify matching posts appear

```bash
bd list --label 'story:US3' --label 'spec:001-static-mdx-blog' --type task
```

Key tasks:
- Generate search index JSON at build time
- Create useSearch hook
- Create SearchBar component
- Handle search unavailable gracefully

**Checkpoint**: Client-side search functional

---

### Phase 7: User Story 6 - Series Navigation (2 tasks) - Priority P2

**Goal**: Visitors can navigate between parts of a multi-part series

**Independent Test**: View a series post and verify SeriesNav shows all parts

```bash
bd list --label 'story:US6' --label 'spec:001-static-mdx-blog' --type task
```

Key tasks:
- Create SeriesNav component
- Register SeriesNav as MDX component

**Checkpoint**: Series navigation works in MDX content

---

### Phase 8: User Story 4 - Browse All Posts (4 tasks) - Priority P3

**Goal**: Visitors can browse all posts at `/blog` sorted by date

**Independent Test**: Navigate to `/blog` and verify all posts appear

```bash
bd list --label 'story:US4' --label 'spec:001-static-mdx-blog' --type task
```

Key tasks:
- Create PostCard component
- Create PostList component
- Create BlogIndex page component
- Generate blog index static HTML

**Checkpoint**: Blog index page complete

---

### Phase 9: Polish & Cross-Cutting Concerns (6 tasks) - Priority P3

**Purpose**: Final polish affecting multiple user stories

```bash
bd list --label 'phase:polish' --label 'spec:001-static-mdx-blog' --type task
```

Key tasks:
- Create styled 404 page for blog
- Accessibility audit and fixes
- Performance optimization and bundle analysis
- Validate success criteria
- Run quickstart.md validation
- Integrate blog build with main build

**Checkpoint**: All success criteria met, ready for release

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup) ─────────────────────┐
                                     │
Phase 2 (Foundational) ◄─────────────┘
         │
         ├──► Phase 3 (US1 - Read Post) ─────┐
         │                                    │
         ├──► Phase 4 (US5 - Author Add) ────┤
         │                                    │
         ├──► Phase 5 (US2 - Tags) ──────────┤
         │                                    │
         ├──► Phase 6 (US3 - Search) ────────┤
         │                                    │
         ├──► Phase 7 (US6 - Series) ────────┤
         │                                    │
         └──► Phase 8 (US4 - Browse) ────────┤
                                              │
Phase 9 (Polish) ◄────────────────────────────┘
```

### Parallel Execution Opportunities

After Phase 2 completes, the following can run in parallel:
- **US1** (Read Post) and **US5** (Author Add) - P1 MVP tasks
- **US2** (Tags), **US3** (Search), **US6** (Series) - P2 tasks
- **US4** (Browse) depends on PostCard from US2

Within each story:
- Models → Services → Components (sequential)
- Different files can be worked in parallel

## MVP Scope

**Minimum Viable Product**: Phases 1-4 (Setup + Foundational + US1 + US5)

This delivers:
- ✅ Visitors can read blog posts with syntax highlighting and TOC
- ✅ Authors can create new posts by adding MDX files
- ✅ Basic blog functionality without search or tag filtering

**MVP Query**:
```bash
bd ready --label 'spec:001-static-mdx-blog' --priority 1 --limit 10
```

## Incremental Delivery

| Increment | Stories | User Value |
|-----------|---------|------------|
| MVP | US1, US5 | Read posts, author workflow |
| +Tags | US2 | Content discovery via topics |
| +Search | US3 | Find specific content quickly |
| +Series | US6 | Navigate multi-part content |
| +Browse | US4 | Full blog index experience |
| +Polish | - | Production quality |

## Status Tracking

Status is tracked only in Beads:

* **Open** → default
* **In Progress** → task being worked on
* **Blocked** → dependency unresolved
* **Closed** → complete

```bash
bd ready --label 'spec:001-static-mdx-blog' --limit 5   # Ready to work
bd list --label 'spec:001-static-mdx-blog' --status 'in progress'  # In progress
bd stats --label 'spec:001-static-mdx-blog'              # Overall progress
```

---

> This file is intentionally light and index-only. Implementation data lives in Beads. Update this file only to point humans and agents to canonical query paths and feature references.
