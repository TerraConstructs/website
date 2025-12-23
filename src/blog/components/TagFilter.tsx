/**
 * TagFilter - Tag filter UI component with clickable chips.
 * Displays all available tags and allows filtering posts by tag.
 */
import type { Tag } from '../types';

interface TagFilterProps {
  tags: Tag[];
  activeTag: string | null;
  onTagSelect: (tag: string | null) => void;
}

export function TagFilter({ tags, activeTag, onTagSelect }: TagFilterProps) {
  return (
    <div className="mb-8">
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        Filter by Topic
      </h2>
      <div className="flex flex-wrap gap-2">
        {/* All option */}
        <button
          onClick={() => onTagSelect(null)}
          className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            activeTag === null
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
          aria-pressed={activeTag === null}
        >
          All
        </button>

        {/* Tag chips */}
        {tags.map((tag) => (
          <button
            key={tag.slug}
            onClick={() => onTagSelect(tag.slug)}
            className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTag === tag.slug
                ? 'bg-purple-600 text-white'
                : 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50'
            }`}
            aria-pressed={activeTag === tag.slug}
          >
            {tag.name}
            <span className="ml-1.5 text-xs opacity-75">({tag.count})</span>
          </button>
        ))}
      </div>
    </div>
  );
}
