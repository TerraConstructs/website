/**
 * Milestones - Centered alternating timeline component for displaying project milestones.
 */

interface Milestone {
  date: string;
  title: string;
  description?: string;
  link?: {
    url: string;
    label: string;
  };
  icon?: 'launch' | 'update' | 'feature' | 'community' | 'milestone';
}

interface MilestonesProps {
  items: Milestone[];
}

const iconMap: Record<string, JSX.Element> = {
  launch: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  ),
  update: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  ),
  feature: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  community: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  milestone: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" x2="4" y1="22" y2="15" />
    </svg>
  ),
};

export function Milestones({ items }: MilestonesProps) {
  return (
    <div className="not-prose my-8 relative">
      {/* Center vertical line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-purple-300 dark:bg-purple-700 -translate-x-1/2" />

      {/* Milestone items */}
      <div className="space-y-6">
        {items.map((item, index) => {
          const Icon = iconMap[item.icon || 'milestone'];
          const isLeft = index % 2 === 0;

          return (
            <div key={index} className="group relative flex items-center">
              {/* Left content */}
              <div className={`w-[calc(50%-1.5rem)] ${isLeft ? 'pr-4 text-right' : ''}`}>
                {isLeft && (
                  <div className="inline-block p-3 rounded-lg transition-all duration-200 group-hover:bg-purple-50 dark:group-hover:bg-purple-900/20 group-hover:shadow-sm">
                    <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                      {item.date}
                    </span>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 transition-colors group-hover:text-purple-700 dark:group-hover:text-purple-300">
                      {item.title}
                    </h4>
                    {item.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                        {item.description}
                      </p>
                    )}
                    {item.link && (
                      <a
                        href={item.link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 hover:underline mt-1"
                      >
                        {item.link.label} ↗
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Center icon */}
              <div className="absolute left-1/2 -translate-x-1/2 z-10 w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-md ring-4 ring-white dark:ring-gray-900 transition-all duration-200 group-hover:scale-125 group-hover:bg-purple-500 group-hover:shadow-lg">
                {Icon}
              </div>

              {/* Right content */}
              <div className={`w-[calc(50%-1.5rem)] ml-auto ${!isLeft ? 'pl-4' : ''}`}>
                {!isLeft && (
                  <div className="p-3 rounded-lg transition-all duration-200 group-hover:bg-purple-50 dark:group-hover:bg-purple-900/20 group-hover:shadow-sm">
                    <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                      {item.date}
                    </span>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 transition-colors group-hover:text-purple-700 dark:group-hover:text-purple-300">
                      {item.title}
                    </h4>
                    {item.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                        {item.description}
                      </p>
                    )}
                    {item.link && (
                      <a
                        href={item.link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 hover:underline mt-1"
                      >
                        {item.link.label} ↗
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
