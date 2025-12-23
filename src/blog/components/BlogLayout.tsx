/**
 * BlogLayout - Shared layout wrapper for all blog pages.
 * Includes header navigation, theme toggle, and footer.
 */
import { ReactNode, useEffect, useState } from "react";
import { getTheme, toggleTheme, initTheme } from "../utils/theme";

interface BlogLayoutProps {
  children: ReactNode;
}

export function BlogLayout({ children }: BlogLayoutProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    initTheme();
    setIsDark(getTheme() === "dark");
  }, []);

  const handleToggleTheme = () => {
    toggleTheme();
    setIsDark(getTheme() === "dark");
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header - matches landing page styling */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and nav */}
            <div className="flex items-center gap-4 lg:gap-8">
              <a href="/" className="flex items-center space-x-2">
                <img
                  src="/logos/terraconstructs_logo_64x64.png"
                  alt="TerraConstructs"
                  className="block w-8 h-8 md:w-10 md:h-10"
                  width="40"
                  height="40"
                />
                <span className="text-lg md:text-xl font-bold whitespace-nowrap">
                  TerraConstructs
                </span>
              </a>
              <nav className="hidden lg:flex items-center gap-6">
                <a
                  href="/"
                  className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium"
                >
                  Home
                </a>
                <a
                  href="/blog"
                  className="text-purple-600 dark:text-purple-400 font-semibold"
                >
                  Blog
                </a>
              </nav>
            </div>

            {/* Theme toggle */}
            <button
              onClick={handleToggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              aria-label="Toggle theme"
              aria-pressed={isDark}
            >
              {isDark ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white py-12 mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <img
                  src="/logos/terraconstructs_logo_64x64.png"
                  alt="TerraConstructs logo"
                  className="w-8 h-8"
                  width="32"
                  height="32"
                />
                <span className="text-xl font-bold">TerraConstructs</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                A powerful, reliable L2 CDKTF Constructs library that ports
                proven AWS CDK L2 constructs to Terraform/OpenTofu.
                Deterministic codebase, built for serious platform teams.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>
                  <a
                    href="https://github.com/terraconstructs/base"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="/blog"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Blog
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>
                  <a
                    href="https://github.com/terraconstructs/base"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-300 dark:border-gray-800 mt-8 pt-8 text-center text-gray-600 dark:text-gray-400 text-sm">
            <p>
              © {new Date().getFullYear()} TerraConstructs. Apache 2.0 License.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
