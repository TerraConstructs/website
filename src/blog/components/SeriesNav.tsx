/**
 * SeriesNav - Multi-part series navigation component for MDX posts.
 * Displays all parts of a series with the current post highlighted.
 */
interface SeriesNavProps {
  series: string; // Series identifier (e.g., "Getting Started with TerraConstructs")
  parts: Array<{
    slug: string; // Post slug
    title: string; // Part title
  }>;
  current: string; // Current post slug
}

export function SeriesNav({ series, parts, current }: SeriesNavProps) {
  return (
    <div className="my-8 p-6 border-2 border-purple-200 dark:border-purple-800 rounded-lg bg-purple-50 dark:bg-purple-900/10">
      {/* Series title */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-200 uppercase tracking-wide mb-1">
          Series
        </h3>
        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
          {series}
        </p>
      </div>

      {/* Series parts list */}
      <ol className="space-y-2">
        {parts.map((part, index) => {
          const isCurrent = part.slug === current;

          return (
            <li key={part.slug} className="flex items-start gap-3">
              {/* Part number badge */}
              <span
                className={`flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full text-sm font-semibold ${
                  isCurrent
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                {index + 1}
              </span>

              {/* Part title/link */}
              {isCurrent ? (
                <span className="flex-1 py-0.5 font-semibold text-purple-900 dark:text-purple-200">
                  {part.title}
                  <span className="ml-2 text-xs font-medium text-purple-700 dark:text-purple-400">
                    (Current)
                  </span>
                </span>
              ) : (
                <a
                  href={`/blog/${part.slug}`}
                  className="flex-1 py-0.5 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:underline transition-colors"
                >
                  {part.title}
                </a>
              )}
            </li>
          );
        })}
      </ol>

      {/* Progress indicator */}
      <div className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-800">
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
          <span>
            Part {parts.findIndex((p) => p.slug === current) + 1} of {parts.length}
          </span>
          <span>
            {Math.round(((parts.findIndex((p) => p.slug === current) + 1) / parts.length) * 100)}%
            Complete
          </span>
        </div>
        <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-600 transition-all duration-300"
            style={{
              width: `${((parts.findIndex((p) => p.slug === current) + 1) / parts.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
