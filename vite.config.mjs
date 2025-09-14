import { defineConfig } from 'vite'
import { readFileSync } from 'node:fs'
import PluginCritical from 'rollup-plugin-critical'
import cspHashPlugin from './plugins/csp-hash.js'
import precomputeDemoCode from './plugins/precompute-demo-code.js'
import sitemapGenerator from './plugins/sitemap-generator.js'

export default defineConfig({
  // Development server configuration
  server: {
    port: 8080,
    open: true,
    host: true // Allow access from network
  },

  // Preview server (serves dist/ with CSP headers for local validation)
  preview: {
    port: 4173,
    strictPort: true,
    headers: {
      'Content-Security-Policy': (() => {
        try {
          const { csp } = JSON.parse(readFileSync('dist/csp.json', 'utf8'))
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
        main: 'index.html'
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
      plugins: [
        PluginCritical({
          // Use the build output directory as the base for reading/writing
          criticalBase: 'dist',
          // Read the built HTML from the build output
          criticalUrl: 'dist/',
          // Single-page app: process index.html
          criticalPages: [
            { uri: 'index.html', template: 'index' },
          ],
          // Inline above‑the‑fold CSS; full CSS loaded non‑blocking (inline-critical default)
          // Use boolean true so rollup-plugin-critical actually inlines
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
    precomputeDemoCode(),
    sitemapGenerator(),
    // Generate CSP hashes from built HTML (dist/index.html)
    cspHashPlugin({ distDir: 'dist', outDir: 'infra' }),
  ]
})
