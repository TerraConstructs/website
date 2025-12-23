/**
 * Vite plugin to handle blog routes during development.
 * Serves blog HTML template for /blog/* routes.
 */
import fs from 'node:fs';
import path from 'node:path';

export default function blogDevServer() {
  return {
    name: 'blog-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // Only handle /blog routes
        if (!req.url?.startsWith('/blog')) {
          return next();
        }

        // Skip asset requests (anything with a file extension)
        // This allows /blog/my-post/image.png to pass through to Vite's asset server
        if (/\.\w+$/.test(req.url)) {
          return next();
        }

        try {
          // Read the dev template
          const templatePath = path.resolve('blog-dev.html');
          const template = fs.readFileSync(templatePath, 'utf-8');

          // Transform HTML to inject Vite client, HMR scripts, etc.
          const html = await server.transformIndexHtml(req.url, template);

          // Send the response
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/html');
          res.end(html);
        } catch (e) {
          server.ssrFixStacktrace(e);
          next(e);
        }
      });
    },
  };
}
