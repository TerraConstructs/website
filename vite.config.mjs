import { defineConfig } from 'vite'
import precomputeDemoCode from './plugins/precompute-demo-code.js'
import sitemapGenerator from './plugins/sitemap-generator.js'

export default defineConfig({
  // Development server configuration
  server: {
    port: 8080,
    open: true,
    host: true // Allow access from network
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
      }
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
    // Custom plugin to handle CSP nonce placeholders in development
    {
      name: 'csp-nonce-dev',
      transformIndexHtml: {
        order: 'pre',
        handler(html, ctx) {
          // In development, remove nonce requirements for easier development
          if (ctx.server) {
            return html.replace(/nonce="__CSP_NONCE__"/g, '')
          }
          return html
        }
      }
    },
    precomputeDemoCode(),
    sitemapGenerator()
  ]
})
