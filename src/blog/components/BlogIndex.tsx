/**
 * BlogIndex - Main blog index page at /blog.
 * Displays all posts in a sorted list.
 */
import { useEffect, useState } from 'react';
import { BlogLayout } from './BlogLayout';
import { PostList } from './PostList';
import type { PostCard } from '../types';

// Pre-load all MDX files using Vite's glob import
const postModules = import.meta.glob('../../blog/*/index.mdx', {
  eager: false,
});

export function BlogIndex() {
  const [posts, setPosts] = useState<PostCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      const loadedPosts: PostCard[] = [];

      for (const path in postModules) {
        try {
          // Extract slug from path: ../../blog/getting-started/index.mdx -> getting-started
          const match = path.match(/\/blog\/([^/]+)\/index\.mdx$/);
          if (!match) continue;

          const slug = match[1];

          // Load the module
          const module = (await postModules[path]()) as any;

          if (module.frontmatter) {
            loadedPosts.push({
              slug,
              title: module.frontmatter.title || 'Untitled',
              date: module.frontmatter.date || new Date().toISOString(),
              excerpt: module.frontmatter.excerpt || '',
              tags: module.frontmatter.tags || [],
              author: module.frontmatter.author,
              readingTime: module.frontmatter.readingTime,
            });
          }
        } catch (err) {
          console.error(`Failed to load post from ${path}:`, err);
        }
      }

      setPosts(loadedPosts);
      setLoading(false);
    }

    loadPosts();
  }, []);

  return (
    <BlogLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Blog
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
            Technical articles about infrastructure as code, CDKTF, and cloud
            development.
          </p>
        </header>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              Loading posts...
            </p>
          </div>
        ) : (
          <PostList posts={posts} />
        )}
      </div>
    </BlogLayout>
  );
}
