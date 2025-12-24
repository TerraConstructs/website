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

  // Preview server (serves dist/ with CSP headers for local validation)
  preview: {
    port: 4173,
    strictPort: true,
    headers: {
      'Content-Security-Policy': (() => {
        try {
          const { csp } = JSON.parse(readFileSync('infra/csp.json', 'utf8'))
          return csp
        } catch {
          return "default-src 'self'"
        }
      })(),
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'same-origin',
      'X-Content-Type-Options': 'nosniff'
    }
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
      // plugins: [
      //   PluginCritical({
      //     criticalBase: 'dist',
      //     criticalUrl: 'dist/',
      //     criticalPages: [
      //       { uri: 'index.html', template: 'index' },
      //     ],
      //     criticalConfig: {
      //       inline: true,
      //       extract: false,
      //       width: 1200,
      //       height: 900,
      //       penthouse: { blockJSRequests: false },
      //     },
      //   }),
      // ],
      plugins: [],
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
