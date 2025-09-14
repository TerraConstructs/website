# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a neobrutalist landing page for TerraConstructs, a CDKTF L2 Constructs library. The page showcases TypeScript, Go, and Python code examples with interactive syntax highlighting and live Terraform synthesis demos.

## Development Commands

```bash
# Development
pnpm install                # Install dependencies
pnpm run dev                # Start Vite dev server on localhost:8080 (auto-opens)
pnpm run build              # Build production bundle to dist/
pnpm run preview            # Preview production build locally
pnpm run clean              # Clean dist/ directory

# Code Quality - Prettier
pnpm run format             # Format all files with Prettier
pnpm run format:check       # Check formatting without modifying files
pnpm run format:staged      # Format specific files (used with git hooks)

# Demo Projects (in demos/ subdirectories)
cd demos/workshop && npm install && npx cdktf synth     # Generate workshop demo Terraform
cd demos/function-url && npm install && npx cdktf synth # Generate function-url demo Terraform
```

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
