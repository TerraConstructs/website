<!--
  Sync Impact Report
  ===================
  Version change: 0.0.0 → 1.0.0 (MAJOR - initial ratification)

  Added Principles:
  - I. Code Quality First
  - II. Manual Testing Discipline
  - III. User Experience Consistency
  - IV. Search Engine Optimization

  Added Sections:
  - Technical Constraints
  - Development Workflow
  - Governance

  Templates requiring updates:
  - .specify/templates/plan-template.md ✅ (Constitution Check section compatible)
  - .specify/templates/spec-template.md ✅ (Success Criteria align with principles)
  - .specify/templates/tasks-template.md ✅ (Phase structure supports quality gates)

  Follow-up TODOs: None
-->

# TerraConstructs Website Constitution

## Core Principles

### I. Code Quality First

Every change MUST adhere to established formatting and style standards before merge.

- **Formatting**: All code MUST pass `pnpm run format:check` with zero violations
- **Single Quotes**: JavaScript/TypeScript MUST use single quotes, semicolons, ES5 trailing commas
- **Indentation**: 2-space indentation, 80 character line width, LF line endings
- **Simplicity**: Prefer minimal, focused changes. Avoid over-engineering and premature abstractions
- **Security**: No inline event handlers. CSP nonce placeholders (`__CSP_NONCE__`) MUST be preserved
- **Dependencies**: New dependencies require justification. Prefer vanilla JS over libraries

**Rationale**: Consistent code reduces cognitive load and prevents style-related merge conflicts.
A frontend-focused landing page benefits from minimal dependencies and straightforward patterns.

### II. Manual Testing Discipline

This project has no automated testing framework. All validation MUST be performed manually.

- **Required Validation**: Every change MUST be verified via `pnpm run dev`
- **Viewport Testing**: Changes affecting layout MUST be tested at 310px, 768px, and 1920px widths
- **Dark Mode**: Theme-affecting changes MUST be validated in both light and dark modes
- **Code Highlighting**: Changes to demo system MUST verify syntax highlighting renders correctly
- **Build Verification**: `pnpm run build` MUST succeed with no errors before considering work complete
- **Browser Testing**: Production builds SHOULD be tested in Chrome, Firefox, and Safari

**Rationale**: Without automated tests, disciplined manual testing is the quality gate.
Responsive design and theming require explicit cross-configuration verification.

### III. User Experience Consistency

The user interface MUST maintain visual and behavioral consistency across all viewports and themes.

- **Responsive Design**: Mobile-first approach from 310px minimum width
- **Typography**: Inter (sans-serif) for body, JetBrains Mono for code. No substitutions
- **Color System**: Use established Tailwind color tokens (ink, paper, accent, neutral)
- **Interactions**: Hover states, focus indicators, and transitions MUST feel consistent
- **Accessibility**: WCAG 2.1 AA compliance required. Proper focus states and ARIA labels
- **Performance**: Core Web Vitals MUST remain in "good" range (LCP < 2.5s, CLS < 0.1)

**Rationale**: A landing page's primary purpose is to present the product clearly.
Inconsistent UX undermines credibility and confuses users.

### IV. Search Engine Optimization

All content and structural changes MUST preserve or enhance search engine visibility.

- **Semantic HTML**: Use appropriate heading hierarchy (h1 → h2 → h3). One h1 per page
- **Meta Tags**: Title, description, and Open Graph tags MUST be present and accurate
- **Structured Data**: JSON-LD schema SHOULD be maintained for product/software context
- **Performance**: Page load performance directly impacts SEO. Lighthouse score MUST stay ≥90
- **Content**: Avoid Lorem Ipsum. All code examples MUST be production-quality TerraConstructs code
- **URLs**: Any navigation MUST use clean, semantic paths. No query parameter abuse

**Rationale**: Organic discovery is critical for developer tool adoption.
Technical SEO establishes baseline visibility that content can build upon.

## Technical Constraints

These constraints reflect the project's architecture and MUST NOT be violated without
constitution amendment.

- **Build System**: Vite with vanilla JavaScript modules. No React/Vue/Svelte frameworks
- **Styling**: Tailwind CSS via PostCSS. Custom CSS in `src/style.css` only
- **Package Manager**: pnpm exclusively. Lock file MUST be committed
- **Demo Architecture**: Real CDKTF projects in `demos/` with actual Terraform synthesis
- **Code Highlighting**: Precomputed at build time via Vite plugin. No runtime highlighting
- **Deployment**: CSP nonce injection handled by deployment layer, not application code

## Development Workflow

Standard workflow for changes to this codebase:

1. **Before Starting**: Run `pnpm install` to ensure dependencies are current
2. **During Development**: Run `pnpm run dev` and validate changes in browser
3. **Before Completion**: Run `pnpm run format` to auto-fix formatting
4. **Verification Gate**: Run `pnpm run build` and confirm zero errors
5. **Manual Testing**: Test responsive layouts and dark mode per Testing Discipline
6. **Documentation**: Update CLAUDE.md if new patterns or commands are introduced

## Governance

This constitution establishes binding principles for all contributions to the TerraConstructs
website repository.

- **Precedence**: Constitution principles override ad-hoc decisions. When in doubt, follow the
  constitution
- **Compliance**: Pull requests and code reviews MUST verify alignment with all applicable
  principles
- **Amendments**: Changes to this constitution require explicit documentation of the change
  rationale and impact assessment
- **Versioning**: MAJOR version for principle removals/redefinitions, MINOR for additions,
  PATCH for clarifications
- **Runtime Guidance**: Use CLAUDE.md for day-to-day development instructions that don't rise
  to constitutional level

**Version**: 1.0.0 | **Ratified**: 2025-12-18 | **Last Amended**: 2025-12-18
