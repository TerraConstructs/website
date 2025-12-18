# Quickstart: Static MDX Blog

**Branch**: `001-static-mdx-blog` | **Date**: 2025-12-18

This guide covers development setup and common tasks for the TerraConstructs blog.

## Prerequisites

- Node.js 18+
- pnpm 10.11.1+
- Git

## Development Setup

```bash
# 1. Switch to feature branch
git checkout 001-static-mdx-blog

# 2. Install dependencies (including new React/MDX packages)
pnpm install

# 3. Start development server
pnpm run dev

# 4. Open browser to http://localhost:8080/blog
```

## Creating a New Blog Post

### 1. Create Post Directory

```bash
mkdir -p blog/your-post-slug
```

### 2. Create MDX File

Create `blog/your-post-slug/index.mdx`:

```mdx
---
title: "Your Post Title"
date: 2025-01-15
author: "Your Name"
tags:
  - aws
  - tutorial
excerpt: "A brief description for listings and SEO."
---

## Introduction

Your content here...

## Code Example

```typescript
import { App, TerraformStack } from 'cdktf';
import { AwsProvider } from '@cdktf/provider-aws';

const app = new App();
const stack = new TerraformStack(app, 'demo');
```

## Conclusion

Wrap up your post.
```

### 3. Add Images (Optional)

Place images in the same directory:

```
blog/your-post-slug/
├── index.mdx
├── architecture.png
└── diagram.svg
```

Reference in MDX:

```mdx
![Architecture diagram](./architecture.png)
```

### 4. Preview

The dev server auto-reloads. Visit `http://localhost:8080/blog/your-post-slug`.

## Frontmatter Reference

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `title` | Yes | string | Post title (max 200 chars) |
| `date` | Yes | string | ISO date (YYYY-MM-DD) |
| `author` | Yes | string | Author name for byline |
| `slug` | No | string | URL slug (defaults to folder name) |
| `tags` | No | string[] | Array of lowercase tags |
| `excerpt` | No | string | Description (auto-generated if omitted) |

## Using Custom Components

### SeriesNav (Multi-Part Series)

```mdx
import { SeriesNav } from '../src/blog/components/SeriesNav';

<SeriesNav
  series="aws-fundamentals"
  parts={[
    { slug: 'part-1-intro', title: 'Introduction' },
    { slug: 'part-2-vpc', title: 'VPC Setup' },
    { slug: 'part-3-ec2', title: 'EC2 Instances' },
  ]}
  current="part-2-vpc"
/>
```

### Code Block Features

#### Line Highlighting

````mdx
```typescript {3-5}
const app = new App();
const stack = new TerraformStack(app, 'demo');
// These lines are highlighted
new AwsProvider(stack, 'aws', { region: 'us-east-1' });
new S3Bucket(stack, 'bucket', { bucket: 'my-bucket' });
```
````

#### Expandable Long Code

````mdx
```typescript collapsed
// Long code block that starts collapsed
// Click to expand...
```
````

## Build Commands

```bash
# Development (with HMR)
pnpm run dev

# Production build
pnpm run build

# Preview production build
pnpm run preview

# Format code
pnpm run format

# Check formatting
pnpm run format:check
```

## Directory Structure

```
blog/                    # MDX content
├── 2025-recap/
│   └── index.mdx
└── [slug]/
    ├── index.mdx
    └── [assets]

src/blog/               # React components
├── index.tsx           # Entry point
├── components/         # UI components
├── hooks/              # Custom hooks
└── utils/              # Utilities

plugins/                # Vite plugins
├── mdx-pipeline.js     # MDX compilation
└── search-index.js     # Search index generation
```

## Testing Checklist

Before committing:

- [ ] `pnpm run build` succeeds
- [ ] `pnpm run format:check` passes
- [ ] Post renders at correct URL
- [ ] TOC appears on desktop (≥768px)
- [ ] TOC drawer works on mobile (<768px)
- [ ] Dark mode displays correctly
- [ ] Code blocks have syntax highlighting
- [ ] Images load properly
- [ ] Tags are clickable and filter posts

## Common Issues

### MDX Parsing Errors

Check frontmatter YAML syntax. Common issues:
- Missing quotes around titles with colons
- Incorrect indentation in tags array
- Invalid date format (use YYYY-MM-DD)

### Images Not Loading

Ensure images are:
- In the same directory as `index.mdx`
- Referenced with relative path (`./image.png`)
- Supported format (png, jpg, svg, webp)

### Build Fails

1. Check `pnpm run format` for style issues
2. Verify all frontmatter required fields present
3. Check for duplicate slugs across posts

## Related Documentation

- [Spec](./spec.md) - Feature requirements
- [Plan](./plan.md) - Implementation plan
- [Data Model](./data-model.md) - TypeScript interfaces
- [Research](./research.md) - Technology decisions
