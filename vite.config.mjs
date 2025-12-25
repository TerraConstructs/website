import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import PluginCritical from 'rollup-plugin-critical';
import react from '@vitejs/plugin-react';
import mdx from '@mdx-js/rollup';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';
import remarkReadingTime from 'remark-reading-time';
import remarkReadingTimeMdx from 'remark-reading-time/mdx';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeExpressiveCode from 'rehype-expressive-code';
import rehypeExtractToc from '@stefanprobst/rehype-extract-toc';
import rehypeExtractTocMdx from '@stefanprobst/rehype-extract-toc/mdx';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import { imagetools } from 'vite-imagetools';
import cspHashPlugin from './plugins/csp-hash.js';
import precomputeDemoCode from './plugins/precompute-demo-code.js';
import sitemapGenerator from './plugins/sitemap-generator.js';
import blogDevServer from './plugins/blog-dev-server.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  // Development server configuration
  server: {
    port: 8080,
    open: true,
    host: true, // Allow access from network
    watch: {
      // Watch blog directory for MDX changes
      ignored: ['!**/blog/**'],
    },
  },

  // Preview server (serves dist/ with path-based CSP headers for local validation)
  preview: {
    port: 4173,
    strictPort: true,
    headers: {
      // Base headers applied to all responses (CSP set via middleware for path-based rules)
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'same-origin',
      'X-Content-Type-Options': 'nosniff',
    },
  },

  // Build configuration
  build: {
    outDir: 'dist',
    emptyOutDir: true,

    // Asset handling
    assetsDir: 'assets',

    // Generate sourcemaps for debugging
    sourcemap: true,

    // Rollup options for advanced bundling
    rollupOptions: {
      input: {
        main: 'index.html',
        // Blog entry point - prerender script will generate HTML shells
        blog: 'src/blog/index.tsx'
      },
      output: {
        // Keep asset names readable
        assetFileNames: (assetInfo) => {
          const fileName = assetInfo.names?.[0] || 'unknown'
          const info = fileName.split('.')
          const ext = info[info.length - 1]
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name].[hash][extname]`
          }
          if (/css/i.test(ext)) {
            return `assets/css/[name].[hash][extname]`
          }
          return `assets/[name].[hash][extname]`
        },
        chunkFileNames: 'assets/js/[name].[hash].js',
        entryFileNames: 'assets/js/[name].[hash].js',
      },
      // Generate & inline Critical CSS for the built HTML
      // TODO: Re-enable - temporarily due to Puppeteer dependency issues in current sandbox
      plugins: [
        PluginCritical({
          criticalBase: 'dist',
          criticalUrl: 'dist/',
          criticalPages: [
            { uri: 'index.html', template: 'index' },
          ],
          criticalConfig: {
            inline: true,
            extract: false,
            width: 1200,
            height: 900,
            penthouse: { blockJSRequests: false },
          },
        }),
      ],
    }
  },

  // CSS preprocessing
  css: {
    postcss: './postcss.config.cjs',
    devSourcemap: true
  },

  // Public directory for static assets
  publicDir: 'public',

  // Optimizations
  optimizeDeps: {},

  // Plugin configuration for additional features
  plugins: [
    // Path-based CSP headers for preview server (mirrors CloudFront behavior)
    {
      name: 'preview-csp-headers',
      configurePreviewServer(server) {
        server.middlewares.use((req, res, next) => {
          try {
            const { csp } = JSON.parse(readFileSync('infra/csp.json', 'utf8'));
            const isBlogPath = req.url?.startsWith('/blog');

            // Blog paths get relaxed CSP (unsafe-inline for expressive-code)
            // Note: 'unsafe-inline' is ignored when hashes are present, so we must remove hashes
            const effectiveCsp = isBlogPath
              ? csp
                  .replace(
                    /style-src[^;]+;/,
                    "style-src 'self' https://fonts.googleapis.com 'unsafe-inline';"
                  )
                  .replace(
                    /script-src[^;]+;/,
                    "script-src 'self' https://www.googletagmanager.com https://www.google-analytics.com 'unsafe-inline';"
                  )
                  .replace(
                    /script-src-attr[^;]+;/,
                    "script-src-attr 'unsafe-inline';"
                  )
              : csp;

            res.setHeader('Content-Security-Policy', effectiveCsp);
          } catch {
            res.setHeader('Content-Security-Policy', "default-src 'self'");
          }
          next();
        });
      },
    },
    // Handle directory index requests in preview server (/blog → /blog/index.html)
    {
      name: 'directory-index',
      configurePreviewServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url && !req.url.includes('.') && !req.url.endsWith('/')) {
            req.url += '/index.html';
          } else if (req.url && req.url.endsWith('/')) {
            req.url += 'index.html';
          }
          next();
        });
      },
    },
    // Blog development server (handle /blog/* routes)
    blogDevServer(),
    // React support for blog subsystem
    react(),
    // MDX compilation with remark/rehype plugins
    mdx({
      providerImportSource: "@mdx-js/react",
      remarkPlugins: [
        remarkFrontmatter,
        remarkReadingTime,
        remarkReadingTimeMdx, // Export reading time for MDX
        [remarkMdxFrontmatter, { name: 'frontmatter' }],
      ],
      rehypePlugins: [
        rehypeSlug,
        [rehypeAutolinkHeadings, { behavior: 'wrap' }],
        [
          rehypeExpressiveCode,
          {
            themes: [
              JSON.parse(
                readFileSync(
                  join(__dirname, 'src/blog/shiki-theme-light.json'),
                  'utf-8'
                )
              ),
              JSON.parse(
                readFileSync(
                  join(__dirname, 'src/blog/shiki-theme-dark.json'),
                  'utf-8'
                )
              ),
            ],
            themeCssSelector: (theme) => {
              // Use the theme name from our JSON files to determine light/dark
              // Our light theme should be default, dark theme when .dark class is present
              if (theme.name && theme.name.toLowerCase().includes('dark')) {
                return '.dark';
              }
              return ':root:not(.dark)';
            },
            defaultProps: {
              wrap: true,
              preserveIndent: true,
            },
            styleOverrides: {
              borderRadius: '0.5rem',
              frames: {
                editorTabBarBackground: 'var(--tw-prose-pre-bg)',
                editorActiveTabBackground: 'var(--tw-prose-pre-bg)',
                editorActiveTabForeground: 'var(--tw-prose-body)',
                terminalTitlebarBackground: 'var(--tw-prose-pre-bg)',
              },
            },
          },
        ],
        rehypeExtractToc,
        [rehypeExtractTocMdx, { name: 'toc' }], // Export TOC as 'toc' (default is 'tableOfContents')
      ],
    }),
    // Image optimization for blog assets
    imagetools(),
    ViteImageOptimizer({
      // Optimize images from blog/ directory
      png: { quality: 80 },
      jpeg: { quality: 80 },
      webp: { quality: 80 },
      avif: { quality: 65 },
    }),
    precomputeDemoCode(),
    sitemapGenerator(),
    // Generate CSP hashes from built HTML (dist/index.html)
    cspHashPlugin({ distDir: 'dist', outDir: 'infra' }),
  ],
})
