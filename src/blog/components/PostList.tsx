/**
 * PostList - Blog index listing component.
 * Displays posts in a responsive grid, sorted by date.
 */
import { PostCard } from './PostCard';
import type { PostCard as PostCardType } from '../types';

interface PostListProps {
  posts: PostCardType[];
}

export function PostList({ posts }: PostListProps) {
  // Sort posts by date descending (newest first)
  const sortedPosts = [...posts].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  if (sortedPosts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">
          No blog posts found.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {sortedPosts.map((post) => (
        <PostCard key={post.slug} post={post} />
      ))}
    </div>
  );
}
