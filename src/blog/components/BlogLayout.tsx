/**
 * BlogLayout - Shared layout wrapper for all blog pages.
 * Includes header navigation, theme toggle, and footer.
 */
import { ReactNode, useEffect, useState } from "react";
import { Github, BookOpen, Menu, X, Sun, Moon } from "lucide-react";
import { getTheme, toggleTheme, initTheme } from "../utils/theme";

interface BlogLayoutProps {
  children: ReactNode;
}

export function BlogLayout({ children }: BlogLayoutProps) {
  const [isDark, setIsDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    initTheme();
    setIsDark(getTheme() === "dark");
  }, []);

  const handleToggleTheme = () => {
    toggleTheme();
    setIsDark(getTheme() === "dark");
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
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
                  href="/blog/"
                  className="text-purple-600 dark:text-purple-400 font-semibold"
                >
                  Blog
                </a>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              {/* Desktop actions */}
              <div className="hidden lg:flex items-center space-x-4">
                <button
                  onClick={handleToggleTheme}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  aria-label="Toggle theme"
                  aria-pressed={isDark}
                >
                  {isDark ? (
                    <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  ) : (
                    <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  )}
                </button>

                <a
                  href="https://github.com/terraconstructs/base"
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  aria-label="GitHub repository"
                  target="_blank"
                  rel="noopener"
                >
                  <Github className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </a>

                <a
                  href="https://constructs.dev/packages/terraconstructs/v/0.1.2?lang=typescript"
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  aria-label="Documentation"
                  target="_blank"
                  rel="noopener"
                >
                  <BookOpen className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </a>

                <a
                  href="https://aws-workshop.terraconstructs.dev"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  target="_blank"
                  rel="noopener"
                >
                  Workshops
                </a>
              </div>

              {/* Mobile actions */}
              <div className="lg:hidden flex items-center space-x-2">
                <button
                  onClick={handleToggleTheme}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  aria-label="Toggle theme"
                  aria-pressed={isDark}
                >
                  {isDark ? (
                    <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  ) : (
                    <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  )}
                </button>

                <button
                  onClick={toggleMobileMenu}
                  className="inline-flex items-center justify-center w-10 h-10 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  aria-expanded={mobileMenuOpen}
                  aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                >
                  {mobileMenuOpen ? (
                    <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  ) : (
                    <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <div
          className={`lg:hidden absolute left-0 right-0 top-full z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 transition-all duration-300 ${
            mobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        >
          <nav
            aria-label="Mobile navigation"
            className="flex flex-col p-3 sm:p-4 gap-2"
          >
            <a
              href="/"
              className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium py-1.5"
            >
              Home
            </a>
            <a
              href="/blog/"
              className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium py-1.5"
            >
              Blog
            </a>

            {/* Mobile Actions */}
            <div className="flex items-center space-x-2 pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
              <a
                href="https://github.com/terraconstructs/base"
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                aria-label="GitHub repository"
                target="_blank"
                rel="noopener"
              >
                <Github className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </a>

              <a
                href="https://constructs.dev/packages/terraconstructs/v/0.1.2?lang=typescript"
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                aria-label="Documentation"
                target="_blank"
                rel="noopener"
              >
                <BookOpen className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </a>

              <a
                href="https://aws-workshop.terraconstructs.dev"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ml-auto"
                target="_blank"
                rel="noopener"
              >
                Workshops
              </a>
            </div>
          </nav>
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
                    href="/blog/"
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
