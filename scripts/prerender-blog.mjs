/**
 * Prerender script for static HTML generation with true SSG.
 * Uses Vite SSR build + ReactDOMServer to generate complete static HTML.
 *
 * Usage: node scripts/prerender-blog.mjs
 */
import { build, createServer } from 'vite';
import { glob } from 'glob';
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

/**
 * Parse MDX frontmatter from a file.
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return {};

  const yaml = match[1];
  const frontmatter = {};

  // Simple YAML parsing (handles our basic needs)
  yaml.split('\n').forEach((line) => {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) return;

    const key = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim();

    if (key === 'tags') {
      frontmatter[key] = [];
      return;
    }

    // Remove quotes
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
 * Generate excerpt from MDX content if not provided.
 * Extracts first paragraph and truncates to ~160 characters.
 */
function generateExcerpt(content) {
  // Remove frontmatter
  const withoutFrontmatter = content.replace(
    /^---\s*\n[\s\S]*?\n---\s*\n/,
    ''
  );

  // Find first paragraph (text before first empty line or heading)
  const firstParagraph = withoutFrontmatter
    .split('\n\n')[0]
    .replace(/^#+\s+/, '') // Remove heading markers
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
    .replace(/[*_`]/g, '') // Remove markdown formatting
    .trim();

  // Truncate to ~160 characters for SEO
  if (firstParagraph.length <= 160) {
    return firstParagraph;
  }

  // Find last complete sentence within 160 chars
  const truncated = firstParagraph.slice(0, 160);
  const lastPeriod = truncated.lastIndexOf('.');
  if (lastPeriod > 100) {
    return truncated.slice(0, lastPeriod + 1);
  }

  // Otherwise truncate at word boundary
  const lastSpace = truncated.lastIndexOf(' ');
  return truncated.slice(0, lastSpace) + '...';
}

/**
 * Extract plain text from MDX content for search indexing.
 * Strips markdown formatting and limits length to keep index size reasonable.
 */
function extractPlainText(content) {
  // Remove frontmatter
  let text = content.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, '');

  // Remove code blocks
  text = text.replace(/```[\s\S]*?```/g, '');
  text = text.replace(/`[^`]+`/g, '');

  // Remove headings markers but keep text
  text = text.replace(/^#+\s+/gm, '');

  // Convert links to text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // Remove emphasis markers
  text = text.replace(/[*_~]/g, '');

  // Remove JSX components (like <SeriesNav />)
  text = text.replace(/<[^>]+>/g, '');

  // Normalize whitespace
  text = text.replace(/\s+/g, ' ').trim();

  // Limit to 1000 characters to keep index size reasonable
  if (text.length > 1000) {
    text = text.slice(0, 1000);
  }

  return text;
}

/**
 * Find client bundle filenames from dist directory.
 */
function findBundles() {
  const jsDir = join(rootDir, 'dist', 'assets', 'js');
  const cssDir = join(rootDir, 'dist', 'assets', 'css');

  const jsFiles = readdirSync(jsDir);
  const cssFiles = readdirSync(cssDir);

  const blogJs = jsFiles.find((f) => f.startsWith('blog.') && f.endsWith('.js'));
  const mainCss = cssFiles.find((f) => f.startsWith('main.') && f.endsWith('.css'));

  if (!blogJs || !mainCss) {
    throw new Error('Could not find client bundles. Run vite build first.');
  }

  return {
    blogJs: `/assets/js/${blogJs}`,
    mainCss: `/assets/css/${mainCss}`,
  };
}

/**
 * Generate complete HTML with SSR content + hydration scripts.
 */
function generatePostHTML(post, renderedHTML, bundles) {
  const { title, date, author, excerpt, tags = [] } = post.frontmatter;
  const slug = post.slug;
  const url = `https://terraconstructs.dev/blog/${slug}`;
  const description = excerpt || title;

  return `<!DOCTYPE html>
<html lang="en" class="h-full scroll-smooth">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title} | TerraConstructs Blog</title>
    <meta name="description" content="${description}" />
    <meta name="author" content="${author}" />
    <link rel="canonical" href="${url}" />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:site_name" content="TerraConstructs" />
    <meta property="article:published_time" content="${date}" />
    <meta property="article:author" content="${author}" />
    ${tags.map((tag) => `<meta property="article:tag" content="${tag}" />`).join('\n    ')}

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />

    <!-- Favicons -->
    <link rel="icon" type="image/png" sizes="64x64" href="/logos/terraconstructs_logo_64x64.png" />
    <link rel="apple-touch-icon" sizes="512x512" href="/logos/terraconstructs_logo_512x512.png" />

    <!-- Styles -->
    <link rel="stylesheet" crossorigin href="${bundles.mainCss}" />
  </head>
  <body>
    <div id="root">${renderedHTML}</div>
    <script type="module" crossorigin src="${bundles.blogJs}"></script>
  </body>
</html>`;
}

/**
 * Generate HTML for the blog index page.
 */
function generateIndexHTML(renderedHTML, bundles) {
  return `<!DOCTYPE html>
<html lang="en" class="h-full scroll-smooth">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Blog | TerraConstructs</title>
    <meta name="description" content="Technical articles about infrastructure as code, CDKTF, and cloud development." />
    <link rel="icon" type="image/png" href="/logos/terraconstructs_logo_64x64.png" />

    <!-- Styles -->
    <link rel="stylesheet" crossorigin href="${bundles.mainCss}" />
  </head>
  <body>
    <div id="root">${renderedHTML}</div>
    <script type="module" crossorigin src="${bundles.blogJs}"></script>
  </body>
</html>`;
}

/**
 * Main prerender function.
 */
async function prerender() {
  console.log('🔨 Starting blog prerender with SSG...\n');

  // Step 1: Build SSR bundle
  console.log('📦 Building SSR bundle...');
  await build({
    build: {
      ssr: 'src/blog/entry-server.tsx',
      outDir: '.temp-ssr',
      emptyOutDir: true,
      rollupOptions: {
        output: {
          format: 'es',
          entryFileNames: 'entry-server.js', // Fixed filename without hash
        },
      },
    },
  });
  console.log('✅ SSR bundle created\n');

  // Step 2: Find client bundle filenames
  const bundles = findBundles();
  console.log(`📦 Found bundles: ${bundles.blogJs}, ${bundles.mainCss}\n`);

  // Step 3: Create Vite SSR server for loading MDX modules
  console.log('🔧 Creating Vite SSR server for MDX loading...');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    mode: 'production', // Use production mode for SSR
  });

  // Step 4: Import SSR rendering functions
  const { renderPost, renderIndex } = await vite.ssrLoadModule(
    '/src/blog/entry-server.tsx'
  );

  // Step 5: Find all blog posts
  const postFiles = await glob('blog/*/index.mdx', { cwd: rootDir });
  console.log(`📄 Found ${postFiles.length} blog posts\n`);

  const posts = [];

  // Step 6: Process each post
  for (const file of postFiles) {
    const fullPath = join(rootDir, file);
    const content = readFileSync(fullPath, 'utf-8');
    const frontmatter = parseFrontmatter(content);

    // Auto-generate excerpt if not provided
    if (!frontmatter.excerpt) {
      frontmatter.excerpt = generateExcerpt(content);
    }

    const slug = basename(dirname(fullPath));
    const post = {
      slug,
      frontmatter,
      filePath: file,
      content, // Store raw content for search index generation
    };

    posts.push(post);

    // Validate required fields
    if (!frontmatter.title || !frontmatter.date || !frontmatter.author) {
      console.error(`❌ Missing required frontmatter in ${file}`);
      await vite.close();
      process.exit(1);
    }

    // Load MDX module using Vite SSR
    const mdxModule = await vite.ssrLoadModule(`/${file}`);

    // Render to HTML with SSR
    const renderedHTML = renderPost(mdxModule);

    // Generate complete HTML with hydration
    const html = generatePostHTML(post, renderedHTML, bundles);
    const outDir = join(rootDir, 'dist', 'blog', slug);
    const outFile = join(outDir, 'index.html');

    mkdirSync(outDir, { recursive: true });
    writeFileSync(outFile, html);
    console.log(
      `✅ Generated: ${slug}/index.html (${renderedHTML.length} bytes prerendered)`
    );
  }

  // Step 7: Aggregate tags from all posts
  console.log('\n🏷️  Aggregating tags...');
  const tagMap = new Map();

  for (const post of posts) {
    const tags = post.frontmatter.tags || [];
    for (const tag of tags) {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
    }
  }

  const aggregatedTags = Array.from(tagMap.entries())
    .map(([name, count]) => ({
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      count,
    }))
    .sort((a, b) => b.count - a.count); // Sort by count descending

  console.log(`✅ Aggregated ${aggregatedTags.length} unique tags`);

  // Write tags.json for client-side use
  const tagsFile = join(rootDir, 'dist', 'blog', 'tags.json');
  writeFileSync(tagsFile, JSON.stringify(aggregatedTags, null, 2));
  console.log(`✅ Generated: blog/tags.json`);

  // Step 8: Generate search index
  console.log('\n🔍 Generating search index...');
  const searchIndex = posts.map((post) => ({
    slug: post.slug,
    title: post.frontmatter.title,
    excerpt: post.frontmatter.excerpt || '',
    tags: post.frontmatter.tags || [],
    content: extractPlainText(post.content),
    date: post.frontmatter.date,
    author: post.frontmatter.author,
  }));

  const searchIndexFile = join(rootDir, 'dist', 'blog', 'search-index.json');
  const searchIndexJSON = JSON.stringify(searchIndex, null, 2);
  writeFileSync(searchIndexFile, searchIndexJSON);

  const searchIndexSize = (searchIndexJSON.length / 1024).toFixed(2);
  console.log(`✅ Generated: blog/search-index.json (${searchIndexSize} KB, ${searchIndex.length} posts)`);

  // Step 8b: Generate posts metadata for blog index (lightweight)
  console.log('\n📋 Generating posts metadata...');
  const postsMetadata = posts.map((post) => ({
    slug: post.slug,
    title: post.frontmatter.title,
    date: post.frontmatter.date,
    excerpt: post.frontmatter.excerpt || '',
    tags: post.frontmatter.tags || [],
    author: post.frontmatter.author,
  }));

  const postsMetadataFile = join(rootDir, 'dist', 'blog', 'posts-metadata.json');
  const postsMetadataJSON = JSON.stringify(postsMetadata, null, 2);
  writeFileSync(postsMetadataFile, postsMetadataJSON);

  const postsMetadataSize = (postsMetadataJSON.length / 1024).toFixed(2);
  console.log(`✅ Generated: blog/posts-metadata.json (${postsMetadataSize} KB, ${postsMetadata.length} posts)`);

  // Step 9: Generate blog index page
  console.log('\n📄 Generating blog index...');
  const indexHTML = renderIndex();
  const completeIndexHTML = generateIndexHTML(indexHTML, bundles);
  const indexDir = join(rootDir, 'dist', 'blog');
  const indexFile = join(indexDir, 'index.html');

  mkdirSync(indexDir, { recursive: true });
  writeFileSync(indexFile, completeIndexHTML);
  console.log(
    `✅ Generated: blog/index.html (${indexHTML.length} bytes prerendered)`
  );

  // Step 10: Close Vite server
  await vite.close();

  console.log(
    `\n✨ Prerender complete! Generated ${posts.length + 1} pages with SSR.`
  );
}

// Run prerender
prerender().catch((err) => {
  console.error('❌ Prerender failed:', err);
  process.exit(1);
});
