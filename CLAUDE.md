# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a neobrutalist landing page for TerraConstructs, a CDKTF L2 Constructs library. The page showcases TypeScript, Go, and Python code examples with interactive syntax highlighting and live Terraform synthesis demos.

## Development Commands

```bash
# Development
pnpm install                 # Install dependencies
pnpm run dev                # Start Vite dev server on localhost:8080 (auto-opens)
pnpm run build              # Build production bundle to dist/
pnpm run preview            # Preview production build locally
pnpm run clean              # Clean dist/ directory

# Demo Projects (in demos/ subdirectories)
cd demos/workshop && npm install && npx cdktf synth    # Generate workshop demo Terraform
cd demos/function-url && npm install && npx cdktf synth # Generate function-url demo Terraform
```

## Architecture

**Frontend Stack**: Vite + Tailwind CSS + highlight.js + vanilla JavaScript modules
- `index.html` - Main page with embedded content
- `src/main.js` - Entry point, theme toggle, mobile menu, typewriter animation
- `src/highlight-setup.js` - Code syntax highlighting used in precompute vite plugin as well as demo switching, copy functionality
- `src/demo-data.js` - raw TypeScript/Terraform from demos/ using Vite `?raw` imports
- `src/tour-configs.js` - Guided tour step definitions, combined with `demo-data.js` in Vite plugin for precomputation.
- `plugins/precompute-demo-code.js` - Vite plugin to precompute highlighted code and tour steps at build time
- `src/guided-tour.js` - Interactive guided tour functionality leveraging precomputed code elements and guided tour segments.
- `src/style.css` - Tailwind directives and custom CSS

**Demo Architecture**: Real CDKTF projects in `demos/` that synthesize to actual Terraform
- Each demo has its own `package.json`, `cdktf.json`, `src/stack.ts`
- Raw files are imported via Vite for live code display and precomputed to HTML elements through a vite plugin
- Generated Terraform from `cdk.tf` files simulate the output section.

**Current Styling**: Neobrutalist design with thick borders, sharp shadows, custom Tailwind theme
- Colors: ink (#111111), paper (#ffffff), accent (#6E59FF), neutral (#EDEDED)
- Typography: Inter (sans), JetBrains Mono (code)
- Dark mode via class toggle with localStorage persistence

**Target Styling**: Bolt mockup for a cleaner, more modern look
- Softer colors, more whitespace, reduced copy
- Uses lucide UI components

## Key Implementation Details

- **No testing framework** - manual validation via `pnpm run dev` and testing viewports/dark mode/code highlighting
- **Security**: CSP-ready with nonce placeholders (`__CSP_NONCE__`) replaced by deployment scripts
- **Package manager**: Uses pnpm (locked to v10.11.1+)
- **Demo content**: All code examples are production TerraConstructs examples, no Lorem Ipsum
- **Responsive**: Mobile-first design (310px → 1920px)

## Demo System

The interactive demo section loads real CDKTF projects:
- `src/demo-data.js` imports raw source files using Vite's `?raw` suffix
- Dropdown allows switching between workshop and function-url demos
- "Run" button displays pre-synthesized Terraform with syntax highlighting
- Statistics show line/character counts for both input and output

## Deployment

Multiple production options in `deploy/` directory:
- `deploy/nginx/` - Nginx with Lua-based nonce generation
- `deploy/nodejs/` - Express server with CSP middleware  
- `deploy/cloudfront/` - CloudFront CDN with Lambda@Edge for CSP injection

Each has its own README with specific deployment instructions.
