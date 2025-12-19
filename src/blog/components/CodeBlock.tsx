/**
 * CodeBlock - Syntax-highlighted code block with copy button and collapse support.
 * Wraps Shiki-highlighted code from MDX compilation.
 */
import { ReactNode, useState } from "react";

interface CodeBlockProps {
  children: ReactNode;
  collapsed?: boolean;
  className?: string;
}

export function CodeBlock({
  children,
  collapsed = false,
  className = "",
}: CodeBlockProps) {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      // Extract text content from the code element
      const codeElement = document.querySelector(".code-block-content code");
      if (!codeElement) return;

      const text = codeElement.textContent || "";
      await navigator.clipboard.writeText(text);

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="relative my-6">
      {/* Code block header with copy button */}
      <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-t-lg px-4 py-2">
        <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
          {className.replace("language-", "")}
        </span>
        <div className="flex items-center space-x-2">
          {collapsed && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {isCollapsed ? "Expand" : "Collapse"}
            </button>
          )}
          <button
            onClick={handleCopy}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center space-x-1"
            aria-label="Copy code"
          >
            {copied ? (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Copied!</span>
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code content */}
      <div
        className={`code-block-content overflow-x-auto border-x border-b border-gray-200 dark:border-gray-700 rounded-b-lg ${
          isCollapsed ? "max-h-64 overflow-y-hidden" : ""
        }`}
      >
        <pre className="p-4 bg-white dark:bg-gray-900 text-sm font-mono leading-relaxed">
          {children}
        </pre>
      </div>

      {/* Expand hint for collapsed blocks */}
      {isCollapsed && collapsed && (
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-gray-900 to-transparent pointer-events-none rounded-b-lg"></div>
      )}
    </div>
  );
}
