/**
 * TOCDrawer - Collapsible table of contents for mobile (<768px).
 * Hidden by default with a toggle button.
 */
import { TOCEntry } from "../types";

interface TOCDrawerProps {
  entries: TOCEntry[];
  activeId: string | null;
  isOpen: boolean;
  onToggle: () => void;
}

export function TOCDrawer({
  entries,
  activeId,
  isOpen,
  onToggle,
}: TOCDrawerProps) {
  if (entries.length === 0) return null;

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      // Close drawer after clicking
      onToggle();
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
              : "text-gray-600 dark:text-gray-400"
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
    <>
      {/* Toggle button (mobile only) */}
      <button
        onClick={onToggle}
        className="lg:hidden fixed bottom-6 right-6 bg-purple-600 dark:bg-purple-500 text-white p-4 rounded-full shadow-lg hover:bg-purple-700 dark:hover:bg-purple-600 z-40"
        aria-label="Toggle table of contents"
        aria-expanded={isOpen}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onToggle}
        />
      )}

      {/* Drawer */}
      <div
        className={`lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 rounded-t-2xl shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ maxHeight: "70vh" }}
      >
        <div
          className="p-6 overflow-y-auto"
          style={{ maxHeight: "calc(70vh - 3rem)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              On this page
            </h2>
            <button
              onClick={onToggle}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              aria-label="Close table of contents"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <ul className="space-y-1">
            {entries.map(entry => renderEntry(entry))}
          </ul>
        </div>
      </div>
    </>
  );
}
