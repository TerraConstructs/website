/**
 * PostCard - Post preview card for blog listings.
 * Displays title, date, excerpt, tags, and reading time.
 */
import type { PostCard as PostCardType } from '../types';

interface PostCardProps {
  post: PostCardType;
}

export function PostCard({ post }: PostCardProps) {
  const { slug, title, date, excerpt, tags, readingTime } = post;

  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 hover:border-purple-500 dark:hover:border-purple-400 transition-colors">
      <a href={`/blog/${slug}`} className="block group">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
          {title}
        </h2>
        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-4">
          <time dateTime={date}>{formattedDate}</time>
          {readingTime && (
            <>
              <span>•</span>
              <span>{Math.ceil(readingTime.minutes)} min read</span>
            </>
          )}
        </div>
        <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
          {excerpt}
        </p>
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </a>
    </article>
  );
}
