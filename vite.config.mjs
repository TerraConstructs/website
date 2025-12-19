import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import PluginCritical from 'rollup-plugin-critical';
import react from '@vitejs/plugin-react';
import mdx from '@mdx-js/rollup';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeShiki from '@shikijs/rehype';
import { transformerNotationHighlight } from '@shikijs/transformers';
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
      remarkPlugins: [
        remarkFrontmatter,
        [remarkMdxFrontmatter, { name: 'frontmatter' }],
      ],
      rehypePlugins: [
        rehypeSlug,
        [rehypeAutolinkHeadings, { behavior: 'wrap' }],
        [
          rehypeShiki,
          {
            themes: {
              light: JSON.parse(
                readFileSync(
                  join(__dirname, 'src/blog/shiki-theme-light.json'),
                  'utf-8'
                )
              ),
              dark: JSON.parse(
                readFileSync(
                  join(__dirname, 'src/blog/shiki-theme-dark.json'),
                  'utf-8'
                )
              ),
            },
            transformers: [transformerNotationHighlight()],
          },
        ],
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
