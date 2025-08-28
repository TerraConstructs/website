import { defineConfig } from 'vite'

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
          const info = assetInfo.name.split('.')
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
    postcss: './postcss.config.js',
    devSourcemap: true
  },

  // Public directory for static assets
  publicDir: 'public',

  // Optimizations
  optimizeDeps: {
    include: [
      'highlight.js/lib/core',
      'highlight.js/lib/languages/typescript',
      'highlight.js/lib/languages/go', 
      'highlight.js/lib/languages/python',
      '@taga3s/highlightjs-terraform'
    ]
  },

  // Plugin configuration for additional features
  plugins: [
    // Custom plugin to handle CSP nonce placeholders in development
    {
      name: 'csp-nonce-dev',
      transformIndexHtml: {
        enforce: 'pre',
        transform(html, ctx) {
          // In development, remove nonce requirements for easier development
          if (ctx.server) {
            return html.replace(/nonce="__CSP_NONCE__"/g, '')
          }
          return html
        }
      }
    }
  ]
})