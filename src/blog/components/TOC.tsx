/**
 * TOC - Table of Contents component for desktop (>=768px).
 * Displays article headings with active section highlighting.
 */
import { TOCEntry } from "../types";

interface TOCProps {
  entries: TOCEntry[];
  activeId: string | null;
}

export function TOC({ entries, activeId }: TOCProps) {
  if (entries.length === 0) return null;

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const renderEntry = (entry: TOCEntry) => {
    const isActive = entry.id === activeId;
    const hasChildren = entry.children && entry.children.length > 0;

    return (
      <li key={entry.id || entry.value} className="mb-2">
        <button
          onClick={() => entry.id && scrollToHeading(entry.id)}
          className={`text-left w-full text-sm transition-colors ${
            isActive
              ? "text-purple-600 dark:text-purple-400 font-semibold"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          } ${entry.depth === 2 ? "" : "pl-4"}`}
        >
          {entry.value}
        </button>
        {hasChildren && (
          <ul className="mt-1 space-y-1">
            {entry.children!.map(child => renderEntry(child))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <nav
      className="hidden lg:block sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto"
      aria-label="Table of contents"
    >
      <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 uppercase tracking-wide">
        On this page
      </h2>
      <ul className="space-y-1">{entries.map(entry => renderEntry(entry))}</ul>
    </nav>
  );
}
