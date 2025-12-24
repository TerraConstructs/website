/**
 * Vite plugin to handle blog routes during development.
 * Serves blog HTML template for /blog/* routes and generates search-index.json on-the-fly.
 */
import fs from 'node:fs';
import path from 'node:path';
import { glob } from 'glob';

/**
 * Parse MDX frontmatter from content.
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return {};

  const yaml = match[1];
  const frontmatter = {};

  yaml.split('\n').forEach((line) => {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) return;

    const key = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim();

    if (key === 'tags') {
      frontmatter[key] = [];
      return;
    }

    frontmatter[key] = value.replace(/^['"]|['"]$/g, '');
  });

  // Parse tags array
  const tagsMatch = yaml.match(/tags:\s*\n((?:  - .+\n?)+)/);
  if (tagsMatch) {
    frontmatter.tags = tagsMatch[1]
      .split('\n')
      .filter(Boolean)
      .map((t) => t.replace(/^\s*-\s*/, '').trim());
  }

  return frontmatter;
}

/**
 * Extract plain text from MDX for search indexing.
 */
function extractPlainText(content) {
  let text = content.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, '');
  text = text.replace(/```[\s\S]*?```/g, '');
  text = text.replace(/`[^`]+`/g, '');
  text = text.replace(/^#+\s+/gm, '');
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  text = text.replace(/[*_~]/g, '');
  text = text.replace(/<[^>]+>/g, '');
  text = text.replace(/\s+/g, ' ').trim();

  if (text.length > 1000) {
    text = text.slice(0, 1000);
  }

  return text;
}

/**
 * Generate search index from blog posts (dev mode).
 */
async function generateSearchIndex() {
  const postFiles = await glob('blog/*/index.mdx');
  const searchIndex = [];

  for (const file of postFiles) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      const frontmatter = parseFrontmatter(content);
      const slug = path.basename(path.dirname(file));

      searchIndex.push({
        slug,
        title: frontmatter.title || 'Untitled',
        excerpt: frontmatter.excerpt || '',
        tags: frontmatter.tags || [],
        content: extractPlainText(content),
        date: frontmatter.date || new Date().toISOString(),
        author: frontmatter.author || 'Unknown',
      });
    } catch (err) {
      console.error(`Failed to process ${file} for search index:`, err);
    }
  }

  return searchIndex;
}

export default function blogDevServer() {
  return {
    name: 'blog-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // Handle /blog/search-index.json in dev mode
        if (req.url === '/blog/search-index.json') {
          try {
            const searchIndex = await generateSearchIndex();
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(searchIndex, null, 2));
            return;
          } catch (err) {
            console.error('Failed to generate search index:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Failed to generate search index' }));
            return;
          }
        }

        // Only handle /blog routes
        if (!req.url?.startsWith('/blog')) {
          return next();
        }

        // Skip asset requests (anything with a file extension)
        // This allows /blog/my-post/image.png and MDX modules to pass through to Vite
        // Parse URL to remove query string before checking extension
        const urlPath = req.url.split('?')[0];
        if (/\.\w+$/.test(urlPath)) {
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
