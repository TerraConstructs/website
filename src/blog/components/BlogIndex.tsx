/**
 * BlogIndex - Main blog index page at /blog.
 * Displays all posts with tag filtering and search support.
 */
import { useEffect, useState } from 'react';
import { BlogLayout } from './BlogLayout';
import { PostList } from './PostList';
import { TagFilter } from './TagFilter';
import { SearchBar } from './SearchBar';
import type { PostCard, Tag } from '../types';

// Pre-load all MDX files using Vite's glob import (for dev mode fallback only)
const postModules = import.meta.glob('../../../blog/*/index.mdx', {
  eager: false,
});

export function BlogIndex() {
  const [posts, setPosts] = useState<PostCard[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load posts and tags on mount
  useEffect(() => {
    async function loadData() {
      let loadedPosts: PostCard[] = [];

      // Try to load posts from pregenerated metadata (production) - OPTIMIZED
      // This is much lighter than loading full MDX files (~1KB vs ~10-25KB each)
      try {
        const response = await fetch('/blog/posts-metadata.json');
        if (response.ok && response.headers.get('content-type')?.includes('json')) {
          const postsData = await response.json();
          loadedPosts = postsData.map((post: any) => ({
            slug: post.slug,
            title: post.title,
            date: post.date,
            excerpt: post.excerpt,
            tags: post.tags || [],
            author: post.author,
            readingTime: 0, // Reading time computed during prerender
          }));
          console.log('✅ Loaded posts from metadata (optimized)');
        } else {
          // Fallback to loading MDX files (dev mode)
          loadedPosts = await loadPostsFromMDX();
        }
      } catch (err) {
        // Dev mode fallback: load MDX files
        console.log('⚠️ posts-metadata.json not found, loading MDX files (dev mode)');
        loadedPosts = await loadPostsFromMDX();
      }

      setPosts(loadedPosts);

      // Try to load tags from generated tags.json (production)
      // If it fails (dev mode), compute tags from loaded posts
      try {
        const response = await fetch('/blog/tags.json');
        if (response.ok && response.headers.get('content-type')?.includes('json')) {
          const tagsData = await response.json();
          setTags(tagsData);
        } else {
          // Dev mode: compute tags from posts
          computeTagsFromPosts(loadedPosts);
        }
      } catch (err) {
        // Dev mode: compute tags from posts
        computeTagsFromPosts(loadedPosts);
      }

      setLoading(false);
    }

    // Helper function to load posts from MDX files (dev mode fallback)
    async function loadPostsFromMDX(): Promise<PostCard[]> {
      const loadedPosts: PostCard[] = [];

      for (const path in postModules) {
        try {
          // Extract slug from path: ../../../blog/getting-started/index.mdx -> getting-started
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
              readingTime: module.readingTime?.minutes || 0,
            });
          }
        } catch (err) {
          console.error(`Failed to load post from ${path}:`, err);
        }
      }

      return loadedPosts;
    }

    // Helper function to compute tags from posts (dev mode fallback)
    function computeTagsFromPosts(posts: PostCard[]) {
      const tagMap = new Map<string, number>();

      for (const post of posts) {
        const postTags = post.tags || [];
        for (const tag of postTags) {
          tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
        }
      }

      const computedTags: Tag[] = Array.from(tagMap.entries())
        .map(([name, count]) => ({
          name,
          slug: name.toLowerCase().replace(/\s+/g, '-'),
          count,
        }))
        .sort((a, b) => b.count - a.count); // Sort by count descending

      setTags(computedTags);
    }

    loadData();
  }, []);

  // Sync active tag with URL hash
  useEffect(() => {
    function handleHashChange() {
      const hash = window.location.hash.slice(1); // Remove #
      const tagMatch = hash.match(/tag=([^&]+)/);
      setActiveTag(tagMatch ? tagMatch[1] : null);
    }

    // Set initial tag from URL
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Handle tag selection
  function handleTagSelect(tagSlug: string | null) {
    if (tagSlug === null) {
      // Clear filter
      window.location.hash = '';
    } else {
      // Set filter
      window.location.hash = `tag=${tagSlug}`;
    }
  }

  // Filter posts by active tag
  const filteredPosts = activeTag
    ? posts.filter((post) =>
        post.tags.some((tag) => tag.toLowerCase().replace(/\s+/g, '-') === activeTag)
      )
    : posts;

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
          <>
            {/* Search bar */}
            <SearchBar />

            {/* Tag filter */}
            {tags.length > 0 && (
              <TagFilter
                tags={tags}
                activeTag={activeTag}
                onTagSelect={handleTagSelect}
              />
            )}

            {/* Post list */}
            <PostList posts={filteredPosts} />

            {/* No results message */}
            {filteredPosts.length === 0 && posts.length > 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">
                  No posts found with the selected tag.
                </p>
                <button
                  onClick={() => handleTagSelect(null)}
                  className="mt-4 text-purple-600 dark:text-purple-400 hover:underline"
                >
                  Clear filter
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </BlogLayout>
  );
}
