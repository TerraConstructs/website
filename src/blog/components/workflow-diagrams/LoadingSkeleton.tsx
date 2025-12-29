/**
 * LoadingSkeleton - Loading placeholder for lazy-loaded workflow diagrams
 */
export function LoadingSkeleton() {
  return (
    <div className="not-prose my-8 h-[500px] animate-pulse">
      <div className="h-full bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-purple-200 dark:border-purple-800 border-t-purple-600 dark:border-t-purple-400 rounded-full animate-spin mb-3"></div>
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            Loading workflow visualization...
          </p>
        </div>
      </div>
    </div>
  );
}
