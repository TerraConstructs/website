/**
 * SearchBar - Search input component with instant fuzzy search results.
 * Uses useSearch hook for Fuse.js powered search with debounced input.
 */
import { useSearch } from '../hooks/useSearch';

export function SearchBar() {
  const { query, setQuery, results, isLoading, error } = useSearch();

  return (
    <div className="mb-8">
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        Search Posts
      </h2>

      {/* Search input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search posts..."
          className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg
            bg-white dark:bg-gray-800
            text-gray-900 dark:text-gray-100
            placeholder-gray-500 dark:placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
            transition-colors"
          aria-label="Search blog posts"
        />
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          Loading search index...
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-300">
            Search unavailable: {error}
          </p>
        </div>
      )}

      {/* Results dropdown */}
      {query.trim() && !isLoading && !error && (
        <div className="mt-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-lg overflow-hidden">
          {results.length > 0 ? (
            <div className="max-h-96 overflow-y-auto">
              {results.map((result) => (
                <a
                  key={result.slug}
                  href={`/blog/${result.slug}`}
                  className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                >
                  {/* Title */}
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {result.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                    {result.excerpt}
                  </p>

                  {/* Meta: Date and tags */}
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
                    <time dateTime={result.date}>
                      {new Date(result.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </time>
                    {result.tags.length > 0 && (
                      <>
                        <span>•</span>
                        <div className="flex gap-1.5">
                          {result.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </a>
              ))}
            </div>
          ) : (
            /* No results */
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                No posts found for "{query}"
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Try different keywords or browse all posts below
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
