/**
 * Prerender script for static HTML generation.
 * Generates dist/blog/[slug]/index.html for each blog post.
 *
 * Usage: node scripts/prerender-blog.mjs
 */
import { glob } from "glob";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, basename } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");

/**
 * Parse MDX frontmatter from a file.
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return {};

  const yaml = match[1];
  const frontmatter = {};

  // Simple YAML parsing (handles our basic needs)
  yaml.split("\n").forEach(line => {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) return;

    const key = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim();

    if (key === "tags") {
      frontmatter[key] = [];
      return;
    }

    // Remove quotes
    frontmatter[key] = value.replace(/^['"]|['"]$/g, "");
  });

  // Parse tags array
  const tagsMatch = yaml.match(/tags:\s*\n((?:  - .+\n?)+)/);
  if (tagsMatch) {
    frontmatter.tags = tagsMatch[1]
      .split("\n")
      .filter(Boolean)
      .map(t => t.replace(/^\s*-\s*/, "").trim());
  }

  return frontmatter;
}

/**
 * Generate excerpt from MDX content if not provided.
 * Extracts first paragraph and truncates to ~160 characters.
 */
function generateExcerpt(content) {
  // Remove frontmatter
  const withoutFrontmatter = content.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, "");

  // Find first paragraph (text before first empty line or heading)
  const firstParagraph = withoutFrontmatter
    .split("\n\n")[0]
    .replace(/^#+\s+/, "") // Remove heading markers
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Convert links to text
    .replace(/[*_`]/g, "") // Remove markdown formatting
    .trim();

  // Truncate to ~160 characters for SEO
  if (firstParagraph.length <= 160) {
    return firstParagraph;
  }

  // Find last complete sentence within 160 chars
  const truncated = firstParagraph.slice(0, 160);
  const lastPeriod = truncated.lastIndexOf(".");
  if (lastPeriod > 100) {
    return truncated.slice(0, lastPeriod + 1);
  }

  // Otherwise truncate at word boundary
  const lastSpace = truncated.lastIndexOf(" ");
  return truncated.slice(0, lastSpace) + "...";
}

/**
 * Generate HTML for a blog post.
 */
function generatePostHTML(post) {
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
    ${tags.map(tag => `<meta property="article:tag" content="${tag}" />`).join("\n    ")}

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />

    <!-- Favicons -->
    <link rel="icon" type="image/png" sizes="64x64" href="/logos/terraconstructs_logo_64x64.png" />
    <link rel="apple-touch-icon" sizes="512x512" href="/logos/terraconstructs_logo_512x512.png" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/blog/index.tsx"></script>
  </body>
</html>`;
}

/**
 * Generate HTML for the blog index page.
 */
function generateIndexHTML(posts) {
  return `<!DOCTYPE html>
<html lang="en" class="h-full scroll-smooth">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Blog | TerraConstructs</title>
    <meta name="description" content="Technical articles about infrastructure as code, CDKTF, and cloud development." />
    <link rel="icon" type="image/png" href="/logos/terraconstructs_logo_64x64.png" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/blog/index.tsx"></script>
  </body>
</html>`;
}

/**
 * Main prerender function.
 */
async function prerender() {
  console.log("🔨 Starting blog prerender...");

  // Find all blog posts
  const postFiles = await glob("blog/*/index.mdx", { cwd: rootDir });
  console.log(`📄 Found ${postFiles.length} blog posts`);

  const posts = [];

  // Process each post
  for (const file of postFiles) {
    const fullPath = join(rootDir, file);
    const content = readFileSync(fullPath, "utf-8");
    const frontmatter = parseFrontmatter(content);

    // Auto-generate excerpt if not provided
    if (!frontmatter.excerpt) {
      frontmatter.excerpt = generateExcerpt(content);
      console.log(`📝 Auto-generated excerpt for ${file}`);
    }

    const slug = basename(dirname(fullPath));
    const post = {
      slug,
      frontmatter,
      filePath: file,
    };

    posts.push(post);

    // Validate required fields
    if (!frontmatter.title || !frontmatter.date || !frontmatter.author) {
      console.error(`❌ Missing required frontmatter in ${file}`);
      process.exit(1);
    }

    // Generate HTML for this post
    const html = generatePostHTML(post);
    const outDir = join(rootDir, "dist", "blog", slug);
    const outFile = join(outDir, "index.html");

    mkdirSync(outDir, { recursive: true });
    writeFileSync(outFile, html);
    console.log(`✅ Generated: ${slug}/index.html`);
  }

  // Generate blog index page
  const indexHTML = generateIndexHTML(posts);
  const indexDir = join(rootDir, "dist", "blog");
  const indexFile = join(indexDir, "index.html");

  mkdirSync(indexDir, { recursive: true });
  writeFileSync(indexFile, indexHTML);
  console.log(`✅ Generated: blog/index.html`);

  console.log(`\n✨ Prerender complete! Generated ${posts.length + 1} pages.`);
}

// Run prerender
prerender().catch(err => {
  console.error("❌ Prerender failed:", err);
  process.exit(1);
});
