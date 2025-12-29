/**
 * BlogLayout - Shared layout wrapper for all blog pages.
 * Includes header navigation, theme toggle, and footer.
 */
import { ReactNode, useEffect, useState } from "react";
import { getTheme, toggleTheme, initTheme } from "../utils/theme";

// Inline SVG icons (optimized - saves ~10KB by not importing lucide-react)
const GithubIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const BookOpenIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const SunIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

const MoonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);

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
                  <span className="w-5 h-5 text-gray-600 dark:text-gray-300">
                    {isDark ? <SunIcon /> : <MoonIcon />}
                  </span>
                </button>

                <a
                  href="https://github.com/terraconstructs/base"
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  aria-label="GitHub repository"
                  target="_blank"
                  rel="noopener"
                >
                  <span className="w-5 h-5 text-gray-600 dark:text-gray-300">
                    <GithubIcon />
                  </span>
                </a>

                <a
                  href="https://constructs.dev/packages/terraconstructs/v/0.1.2?lang=typescript"
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  aria-label="Documentation"
                  target="_blank"
                  rel="noopener"
                >
                  <span className="w-5 h-5 text-gray-600 dark:text-gray-300">
                    <BookOpenIcon />
                  </span>
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
                  <span className="w-5 h-5 text-gray-600 dark:text-gray-300">
                    {isDark ? <SunIcon /> : <MoonIcon />}
                  </span>
                </button>

                <button
                  onClick={toggleMobileMenu}
                  className="inline-flex items-center justify-center w-10 h-10 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  aria-expanded={mobileMenuOpen}
                  aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                >
                  <span className="w-5 h-5 text-gray-600 dark:text-gray-300">
                    {mobileMenuOpen ? <XIcon /> : <MenuIcon />}
                  </span>
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
                <span className="w-5 h-5 text-gray-600 dark:text-gray-300">
                  <GithubIcon />
                </span>
              </a>

              <a
                href="https://constructs.dev/packages/terraconstructs/v/0.1.2?lang=typescript"
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                aria-label="Documentation"
                target="_blank"
                rel="noopener"
              >
                <span className="w-5 h-5 text-gray-600 dark:text-gray-300">
                  <BookOpenIcon />
                </span>
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
