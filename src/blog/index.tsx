/**
 * Blog entry point - React application for /blog/* routes.
 * This is code-split from the main landing page bundle.
 */
import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { MDXProvider } from "@mdx-js/react";
import { BlogLayout } from "./components/BlogLayout";
import { BlogIndex } from "./components/BlogIndex";
import { PostPage, mdxComponents } from "./components/PostPage";
import { initTheme } from "./utils/theme";

// Initialize theme before rendering
initTheme();

// Pre-load all MDX files using Vite's glob import
const posts = import.meta.glob("../../blog/*/index.mdx", { eager: false });

// Cache for posts metadata (includes hasAudio)
let postsMetadataCache: Map<string, { hasAudio: boolean }> | null = null;

/**
 * Fetch posts metadata to get hasAudio for each post.
 * Cached after first fetch.
 */
async function getPostsMetadata(): Promise<Map<string, { hasAudio: boolean }>> {
  if (postsMetadataCache) return postsMetadataCache;

  try {
    const response = await fetch('/blog/posts-metadata.json');
    if (!response.ok) throw new Error('Failed to fetch posts metadata');
    const data = await response.json();
    postsMetadataCache = new Map(
      data.map((post: { slug: string; hasAudio?: boolean }) => [
        post.slug,
        { hasAudio: post.hasAudio || false }
      ])
    );
    return postsMetadataCache;
  } catch (error) {
    console.warn('Could not load posts metadata for audio detection:', error);
    return new Map();
  }
}

/**
 * Main blog app component.
 * Routes are handled by prerendered HTML pages in production.
 * In development, dynamically loads MDX files.
 */
function App() {
  const [post, setPost] = useState<any>(null);
  const [hasAudio, setHasAudio] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check current path to determine what to render
  const path = window.location.pathname;

  useEffect(() => {
    async function loadPost() {
      // Extract slug from path (e.g., /blog/getting-started -> getting-started)
      const match = path.match(/^\/blog\/([^/]+)\/?$/);
      if (!match) {
        setLoading(false);
        return;
      }

      const slug = match[1];
      const postPath = `../../blog/${slug}/index.mdx`;

      try {
        // Check if the post exists in our glob
        if (!(postPath in posts)) {
          throw new Error(`Post not found: ${slug}`);
        }

        // Dynamically import MDX file and fetch metadata in parallel
        const [module, metadata] = await Promise.all([
          posts[postPath](),
          getPostsMetadata()
        ]);

        setPost(module);
        setHasAudio(metadata.get(slug)?.hasAudio || false);
        setError(null);
      } catch (err) {
        console.error(`Failed to load blog post: ${slug}`, err);
        setError(`Failed to load blog post: ${slug}`);
      } finally {
        setLoading(false);
      }
    }

    loadPost();
  }, [path]);

  if (path === "/blog" || path === "/blog/") {
    // Blog index page - render post list
    return <BlogIndex />;
  }

  // Individual post page
  if (loading) {
    return (
      <BlogLayout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </BlogLayout>
    );
  }

  if (error || !post) {
    return (
      <BlogLayout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8">
            Post Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {error || "The blog post you're looking for doesn't exist."}
          </p>
        </div>
      </BlogLayout>
    );
  }

  // Render post with MDX content
  const { default: Content, frontmatter, toc, readingTime } = post;

  // Extract slug from path for AudioPlayer
  const slugMatch = path.match(/^\/blog\/([^/]+)\/?$/);
  const slug = slugMatch ? slugMatch[1] : '';

  return (
    <MDXProvider components={mdxComponents}>
      <PostPage
        frontmatter={frontmatter}
        toc={toc || []}
        readingTime={readingTime}
        slug={slug}
        hasAudio={hasAudio}
      >
        <Content />
      </PostPage>
    </MDXProvider>
  );
}

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

export default App;
