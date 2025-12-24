# Session 02: MVP Validation & Gap Analysis

**Date**: 2025-12-19
**Branch**: `001-static-mdx-blog`
**Epic**: `website-86d`

## Session Summary

This session attempted to validate the MVP by testing the dev server and build process. Critical gaps were discovered between the design specifications and actual implementation, requiring a return to the research phase.

## Work Attempted

### User-Reported Issues

1. Landing page and blog builds were conflicting (`emptyOutDir: true` clearing dist/)
2. `pnpm run dev` only served landing page, not `/blog/*` routes
3. Blog posts not loading (404 on `/blog/getting-started`)
4. Header/footer styling different between landing page and blog
5. No blog link in landing page navigation
6. Dark mode toggle not affecting blog footer

### Changes Made (Partially Complete)

#### Files Created:
- `plugins/blog-dev-server.js` - Custom Vite middleware for `/blog/*` routes
- `blog-dev.html` - HTML template for blog dev mode
- `src/blog/components/PostCard.tsx` - Post preview card (MVP implementation)
- `src/blog/components/PostList.tsx` - Post grid layout (MVP implementation)
- `src/blog/components/BlogIndex.tsx` - Blog index page (MVP implementation)

#### Files Modified:
- `package.json` - Added `@mdx-js/react`, chained build scripts
- `vite.config.mjs` - Multiple changes (see git diff):
  - Added path helpers for absolute paths
  - Added `blogDevServer()` plugin
  - Added blog entry to rollup input
  - Fixed remark-mdx-frontmatter config
  - Fixed Shiki theme loading (JSON objects vs paths)
  - Disabled rollup-plugin-critical (Puppeteer issue)
- `src/blog/index.tsx` - Changed to `import.meta.glob`, added BlogIndex routing
- `src/blog/components/BlogLayout.tsx` - Updated header/footer styling
- `index.html` - Added blog links to navigation (desktop + mobile)

### Root Cause Discovered

Blog posts still don't load because:

1. **Missing plugin**: `remark-reading-time` not installed (design says it should be)
2. **Missing config**: `@stefanprobst/rehype-extract-toc` installed but not configured
3. **MDX exports broken**: Without TOC plugin, MDX modules don't export `toc` property
4. **Components expect missing data**: PostPage expects `toc`, BlogIndex expects full frontmatter

## Analysis: How This Could Have Been Avoided

### What Went Wrong

1. **Did not read tasks.md first**
   - Jumped straight into fixing reported issues
   - Should have checked which phase we were in and what tasks were ready
   - Missed that Phase 4 tasks were marked "closed" but not actually validated

2. **Did not read design specs before implementing**
   - Created `blogDevServer` middleware without checking if this was the intended approach
   - Modified vite.config.mjs without reading website-9gz design requirements
   - Created PostCard/PostList/BlogIndex without checking Phase 8 task designs first

3. **Did not check Beads issue comments**
   - Session 1 may have left notes about implementation decisions
   - Would have seen what was actually implemented vs what was designed

4. **Reactive instead of proactive**
   - Responded to symptoms (404 errors) instead of understanding root cause
   - Made multiple changes hoping something would work
   - Should have traced the full data flow first

5. **Did not validate assumptions**
   - Assumed MDX was configured correctly because tasks were "closed"
   - Assumed prerender script matched design because it existed
   - Should have run `bd show` on relevant tasks to check acceptance criteria

### The Session 1 Prompt Problem

The "Next Session Prompt" in session-01.md said:
```
Continue implementing the static MDX blog feature (website-86d).

CONTEXT TO READ:
1. specs/001-static-mdx-blog/session-01.md - This file (progress summary)
2. specs/001-static-mdx-blog/plan.md - Implementation plan
3. specs/001-static-mdx-blog/tasks.md - Task index (Beads structure)

FIND READY WORK:
bd ready --label 'spec:001-static-mdx-blog' --priority 1 --limit 10
```

**Problems with this prompt**:
1. Says "continue implementing" but doesn't specify WHAT to implement
2. Lists files to read but doesn't mandate reading them BEFORE making changes
3. Doesn't mention checking design specs in Beads before coding
4. Doesn't emphasize validating existing work before adding new code
5. Doesn't warn about the gap between "task closed" and "task validated"

## Open Questions (Resolved in this session)

The following questions were identified, moved to `specs/001-static-mdx-blog/research.md`, and **resolved**:

- **Question 5**: Development Server Routing (Resolved) -> **Refined Custom Middleware** (`website-ck4.1`)
- **Question 6**: Prerender Script Implementation (Resolved) -> **Rewrite for True SSG** (`website-xvr`, `website-ck4.2`)
- **Question 7**: Missing MDX Pipeline Configuration (Resolved) -> **Installed & Configured** (`website-2np`)
- **Question 8**: Header/Footer Consistency (Resolved) -> **Visual Match Only** (`website-a9c`)

See `specs/001-static-mdx-blog/research.md` for full decision records.

## Current State (End of Session)

### What Was Broken (Now Fixed)
- **Dev Server Routing**: Fixed via `website-ck4.1` (refined middleware).
- **MDX Configuration**: Fixed via `website-2np` (installed plugins).
- **Prerender Script**: In progress (`website-xvr` reopened, SSR entry point `website-ck4.2` created).

### What's Still In Progress
- **Prerender Script Rewrite**: `website-xvr` needs to be implemented using the new SSR entry point.
- **Component Hydration**: `PostPage` and `BlogIndex` need to be updated to support the new data flow.

### Git Status
Multiple uncommitted changes including:
- `vite.config.mjs` (MDX plugins)
- `plugins/blog-dev-server.js` (Refined middleware)
- `src/blog/entry-server.tsx` (New SSR entry point)
- `package.json` (New dependencies)

## Beads Updates Completed

All research gaps identified above have been documented in Beads:
- **website-86d**: Epic updated with Session 2 gap analysis.
- **website-2np**: Reopened, commented on missing install, then closed after fix.
- **website-9gz**: Reopened and updated with refined Vite config requirements.
- **Tasks Reopened for Validation**: `website-xvr`, `website-mfq`, `website-a9c`, `website-fvc`, `website-abj` were reopened to ensure they align with new decisions.
- **New Foundation Tasks**: Created `website-ck4.1` (Dev Server) and `website-ck4.2` (SSR Entry) to bridge the architectural gaps.

---

## Improved Resume Prompt Template

For future sessions, use this prompt structure:

```markdown
# Resume: Static MDX Blog (website-86d)

## MANDATORY PRE-WORK (Do not skip)

Before making ANY code changes:

1. **Read the spec documents** (5 min):
   - `specs/001-static-mdx-blog/research.md` - Decisions and open questions
   - `specs/001-static-mdx-blog/plan.md` - Architecture and approach
   - `specs/001-static-mdx-blog/tasks.md` - Phase structure and dependencies

2. **Check current phase status**:
   ```bash
   bd ready --label 'spec:001-static-mdx-blog' --limit 10
   ```

3. **Read previous session notes**:
   - `specs/001-static-mdx-blog/session-XX.md` (most recent)
   - Check for open questions, blockers, or incomplete work

4. **Before implementing any task**, read its design:
   ```bash
   bd show <task-id> && bd comments <task-id>
   ```

## CURRENT STATUS

- **Last Session**: session-02 (2025-12-19)
- **Phase**: Foundational (Phases 1-2 completion)
- **Completed**: MDX pipeline fix, Dev Server routing refinement, SSR Entry Point implementation.
- **Ready to Work**: Rewrite prerender script (`website-xvr`) for true SSG.

## WHAT TO DO

1. Review open questions in research.md (Questions 5-8)
2. Propose decisions for each question
3. Get user approval before implementing
4. Update research.md with decisions
5. Then proceed with implementation following tasks.md

## WHAT NOT TO DO

- Do NOT make code changes before reading design specs
- Do NOT assume "closed" tasks are fully validated
- Do NOT create new components without checking if they're in scope
- Do NOT modify vite.config.mjs without checking website-9gz requirements
```

---

## Session Statistics

- **Duration**: ~3.5 hours (including research revisit and foundation fixes)
- **Issues Identified**: 4 open questions resolved in research.md
- **Files Created**: `src/blog/entry-server.tsx` (SSR entry point)
- **Files Modified**: `vite.config.mjs`, `plugins/blog-dev-server.js`, `package.json`, `tasks.md`
- **Root Cause Found**: Missing MDX plugin configuration & architectural gap in SSG strategy
- **Outcome**: Foundation strengthened; dev server fixed; SSR path established. Ready for SSG implementation.
