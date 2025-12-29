# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Note**: This project uses [bd (beads)](https://github.com/steveyegge/beads) for issue tracking. Use `bd` commands instead of markdown TODOs. See AGENTS.md for workflow details.

## Project Overview

This is a neobrutalist landing page for TerraConstructs, a CDKTF L2 Constructs library. The page showcases TypeScript, Go, and Python code examples with interactive syntax highlighting and live Terraform synthesis demos.

## Beads (Issue Tracking) Best Practices

### ⚠️ CRITICAL: Avoid Context Exhaustion with bd list

**NEVER run `bd list` without rigorous filtering or limits!** This will kill your context:

```bash
# ❌ DANGER: Even CLI can consume 5k-15k tokens without filters
bd list  # Lists ALL issues with full descriptions

# ✅ SAFE: Always use specific filters
bd search --limit 10
bd list --status open --priority 1 --limit 5

# ✅ BETTER: Use targeted queries
bd ready --limit 5 # CLI: Find unblocked issues
bd show website-xxxx  # CLI: View one issue
```

### Workflow Pattern

1. Create issue: `bd create` with full description
2. Update progress: `bd comments add`
3. Update status: `bd update` for status/priority changes
4. Close issue: `bd close` with reason

### Common Commands

```bash
bd show website-xxxx && bd comments website-xxxx # View issue details + comments
bd ready --limit 5                         # Find issues ready to work on
```

## Development Commands

```bash
# Development
pnpm install                # Install dependencies
pnpm run dev                # Start Vite dev server on localhost:8080 (auto-opens)
pnpm run build              # Build production bundle to dist/
pnpm run build:critical     # Build with critical CSS (requires Chrome)
pnpm run build:full         # Build with critical CSS + TTS audio generation
pnpm run preview            # Preview production build locally
pnpm run clean              # Clean dist/ directory

# Blog TTS Audio
# See docs/blog-tts-setup.md for detailed guide
node scripts/generate-blog-audio.mjs --slug <slug>        # Generate audio for one post
node scripts/generate-blog-audio.mjs --slug <slug> --review  # Generate editable transcript
node scripts/generate-blog-audio.mjs                      # Generate audio for all posts

# Code Quality - Prettier
pnpm run format             # Format all files with Prettier
pnpm run format:check       # Check formatting without modifying files
pnpm run format:staged      # Format specific files (used with git hooks)

# Demo Projects (in demos/ subdirectories)
cd demos/workshop && npm install && npx cdktf synth     # Generate workshop demo Terraform
cd demos/function-url && npm install && npx cdktf synth # Generate function-url demo Terraform
```

## Critical CSS Generation

The build process generates and inlines critical CSS for faster initial page loads. This requires Chrome/Chromium to be installed.

**Default Build** (`pnpm run build`):
- Assumes puppeteer installed Chrome/Chromium works

### Chrome Installation Options

**Option 1: Global Puppeteer** (Recommended)
```bash
npm install -g puppeteer
```
- Automatically downloads Chrome to `~/.cache/puppeteer/chrome/`
- Use: `pnpm run build:critical`

**Option 2: System Chrome**
```bash
# Ubuntu/Debian
sudo apt install chromium-browser

# macOS
brew install chromium
```
- After installing, edit the `build:critical` script in `package.json`
- Update `PUPPETEER_EXECUTABLE_PATH` to point to your system Chrome

**Option 3: Shell Script** (Auto-detection)
```bash
./scripts/build-with-critical.sh
```
- Assumes pre-installed global chrome and
- Automatically finds Chrome in common locations
- Provides clear error messages if Chrome not found
- More flexible than hardcoded package.json script

### Troubleshooting

If `build:critical` fails with "Browser is not downloaded":
1. Verify Chrome installation: `ls ~/.cache/puppeteer/chrome/`
2. Or install globally: `npm install -g puppeteer`
3. Or use the shell script: `./scripts/build-with-critical.sh`

## Architecture

**Frontend Stack**: Vite + Tailwind CSS + vanilla JavaScript modules (syntax highlighting precomputed at build time)

- `index.html` - Main page with embedded content
- `src/main.js` - Entry point, theme toggle, mobile menu, typewriter animation
- `src/demo-section.js` - Demo switching, copy functionality, dropdown/badges, tour button wiring
- `src/code-view.js` - Presents precomputed code HTML with minimal helpers
- `src/tour-configs.js` - Guided tour step definitions, combined with `demo-data.js` in Vite plugin for precomputation.
- `plugins/precompute-demo-code.js` - Vite plugin to precompute highlighted code and tour steps at build time
- `src/guided-tour.js` - Interactive guided tour functionality leveraging precomputed code elements and guided tour segments.
- `src/style.css` - Tailwind directives and custom CSS

**Demo Architecture**: Real CDKTF projects in `demos/` that synthesize to actual Terraform

- Each demo has its own `package.json`, `cdktf.json`, `src/stack.ts`
- Code is precomputed to HTML (with syntax highlighting and tour segments) via a Vite plugin and exposed as a virtual module
- Generated Terraform from `cdk.tf` files simulate the output section.

**Styling**: cleaner, modern look

- Softer colors, more whitespace, reduced copy
- Uses lucide UI components
- Typography: Inter (sans), JetBrains Mono (code)
- Dark mode via class toggle with localStorage persistence

## Key Implementation Details

- **No testing framework** - manual validation via `pnpm run dev` and testing viewports/dark mode/code highlighting
- **Security**: CSP-ready with nonce placeholders (`__CSP_NONCE__`) replaced by deployment scripts
- **Package manager**: Uses pnpm (locked to v10.11.1+)
- **Demo content**: All code examples are production TerraConstructs examples, no Lorem Ipsum
- **Responsive**: Mobile-first design (310px → 1920px)

## Demo System

The interactive demo section loads real CDKTF projects:

- Uses the virtual module `virtual:demo-precomputed` built by the Vite plugin
- Dropdown switches between demos; CodeView renders precomputed HTML
- "Synth" button displays pre-synthesized Terraform (CodeView)
- Statistics show line counts for both input and output

## Deployment

Multiple production options in `deploy/` directory:

- `deploy/nginx/` - Nginx with Lua-based nonce generation
- `deploy/nodejs/` - Express server with CSP middleware
- `deploy/cloudfront/` - CloudFront CDN with Lambda@Edge for CSP injection

Each has its own README with specific deployment instructions.

## Code Quality & Formatting

**Key Settings**:

- Single quotes, semicolons, ES5 trailing commas
- 2-space indentation, 80 character line width
- LF line endings, preserve HTML whitespace sensitivity
- Arrow functions without parentheses when possible

**IDE Integration**:

- VS Code: Install Prettier extension, enable "Format on Save"
- Configure `editor.formatOnSave: true` in settings
- Use `editor.codeActionsOnSave` for additional automation

**Pre-commit Hooks (Optional)**:

```bash
# Install husky for git hooks (optional)
pnpm add -D husky lint-staged

# Configure in package.json
"lint-staged": {
  "*.{js,mjs,ts,html,css,md,json}": ["prettier --write"]
}
```

**CI/CD Integration**:

- Add `pnpm run format:check` to CI pipeline
- Prevents commits with inconsistent formatting
- Maintains code quality across team contributions

## Active Technologies

- TypeScript/JavaScript (ES2022), React 19, Node.js 18+ + React 19, @mdx-js/rollup, Shiki, Fuse.js, rehype/remark plugins (001-static-mdx-blog)
- N/A (static files - MDX content in `/blog` directory) (001-static-mdx-blog)

## Recent Changes

- 001-static-mdx-blog: Added TypeScript/JavaScript (ES2022), React 19, Node.js 18+ + React 19, @mdx-js/rollup, Shiki, Fuse.js, rehype/remark plugins
