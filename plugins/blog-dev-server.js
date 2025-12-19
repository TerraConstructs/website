/**
 * Vite plugin to handle blog routes during development.
 * Serves blog HTML template for /blog/* routes.
 */
export default function blogDevServer() {
  return {
    name: 'blog-dev-server',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Handle blog routes: /blog, /blog/, /blog/*, /blog/*/
        if (req.url?.startsWith('/blog')) {
          // Serve blog entry point HTML
          req.url = '/blog-dev.html';
        }
        next();
      });
    },
  };
}
