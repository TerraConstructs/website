# Blog Bundle Size Optimization Summary

## Problem
The blog was loading in 3 seconds from the CDN, which was too slow. Investigation revealed several critical bundle size issues.

## Optimizations Implemented

### 1. ✅ Lazy Load Fuse.js (~26KB saved)
**Location:** `src/blog/hooks/useSearch.ts`

**Problem:** Fuse.js (26KB minified) was imported eagerly at the top of the file, despite being only needed when users search.

**Solution:** Changed to dynamic import:
```typescript
// Before:
import Fuse from 'fuse.js';

// After:
import type Fuse from 'fuse.js';
// Then in loadSearchIndex():
const { default: Fuse } = await import('fuse.js');
```

**Impact:** ~26KB removed from main bundle, loaded only when search is used.

---

### 2. ✅ Fix BlogIndex Loading All MDX Files (~50-150KB saved)
**Location:** `src/blog/components/BlogIndex.tsx`, `scripts/prerender-blog.mjs`

**Problem:** The blog index page loaded **all 6 blog posts** (full MDX with compiled React components, syntax highlighting, etc.) just to display a list of titles/excerpts. Each post ~10-25KB.

**Solution:**
1. Updated `prerender-blog.mjs` to generate `posts-metadata.json` with only frontmatter (~1KB per post)
2. Updated `BlogIndex.tsx` to fetch lightweight metadata instead of full MDX files
3. Kept MDX loading as fallback for dev mode

**Impact:** ~50-150KB saved on blog index page load.

---

### 3. ✅ Replace lucide-react with Inline SVGs (~5-10KB saved)
**Location:** `src/blog/components/BlogLayout.tsx`

**Problem:** lucide-react is a large library (~150KB+ uncompressed). Even with tree-shaking, adds unnecessary weight.

**Solution:** Replaced lucide-react imports with inline SVG components:
```tsx
// Before:
import { Github, BookOpen, Menu, X, Sun, Moon } from "lucide-react";

// After:
const GithubIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" ...>
    <path d="..." />
  </svg>
);
```

**Impact:** ~5-10KB saved, no external dependency for blog icons.

**Note:** The main landing page uses the lighter `lucide` package (not `lucide-react`), which is fine.

---

### 4. ✅ Add Bundle Analyzer
**Location:** `vite.config.mjs`, `package.json`

**Added:** rollup-plugin-visualizer to generate bundle analysis

**Usage:** After build, check `dist/stats.html` for interactive bundle size visualization.

**Configuration:**
```javascript
visualizer({
  filename: 'dist/stats.html',
  open: false,
  gzipSize: true,
  brotliSize: true,
  template: 'treemap',
})
```

---

## Files Modified

### Source Code
- `src/blog/hooks/useSearch.ts` - Lazy load Fuse.js
- `src/blog/components/BlogIndex.tsx` - Fetch lightweight metadata
- `src/blog/components/BlogLayout.tsx` - Inline SVG icons

### Build Scripts
- `scripts/prerender-blog.mjs` - Generate posts-metadata.json
- `vite.config.mjs` - Add bundle analyzer plugin

### Dependencies
- `package.json` - Removed `lucide-react`, added `rollup-plugin-visualizer`

---

## Expected Impact

| Optimization | Size Saved | Load Time Improvement |
|-------------|-----------|----------------------|
| Lazy load Fuse.js | ~26KB | Immediate |
| Fix BlogIndex loading | ~50-150KB | Significant |
| Replace lucide-react | ~5-10KB | Moderate |
| **Total** | **~80-190KB** | **~1-2s faster** |

## Next Steps

1. **Build and test:** Run `pnpm build` to generate optimized bundles
2. **Analyze bundle:** Check `dist/stats.html` to verify optimizations
3. **Deploy:** Deploy to CDN and measure real-world performance
4. **Monitor:** Use browser DevTools Network tab to verify bundle sizes

## Additional Recommendations

### Code Splitting
- Ensure each blog post's MDX is code-split (already configured via `import.meta.glob` with `eager: false`)
- Verify no shared chunks are pulling in unused dependencies

### Image Optimization
- The project already uses `vite-imagetools` and `vite-plugin-image-optimizer`
- Consider lazy loading blog post images with `loading="lazy"`

### CSS Optimization
- rehype-expressive-code generates substantial CSS for syntax highlighting
- Consider extracting critical CSS for above-the-fold content
- Verify code block styles are not duplicated across chunks

### Caching Strategy
- Set long cache headers for hashed assets (`/assets/js/blog.[hash].js`)
- Use service worker or CDN edge caching for static JSON files

---

## Build Commands

```bash
# Install dependencies (if needed)
pnpm install

# Build optimized bundles
pnpm build

# Preview locally
pnpm preview

# View bundle analysis
open dist/stats.html
```

---

## Notes

- All optimizations maintain backward compatibility with dev mode
- Fallbacks ensure graceful degradation if JSON files are unavailable
- The prerender script automatically generates all required JSON files during build
