/**
 * Blog entry point - React application for /blog/* routes.
 * This is code-split from the main landing page bundle.
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BlogLayout } from "./components/BlogLayout";
import { initTheme } from "./utils/theme";

// Initialize theme before rendering
initTheme();

/**
 * Main blog app component.
 * Routes are handled by prerendered HTML pages.
 * This provides client-side interactivity for static pages.
 */
function App() {
  // Check current path to determine what to render
  const path = window.location.pathname;

  if (path === "/blog" || path === "/blog/") {
    // Blog index page
    return (
      <BlogLayout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8">
            Blog
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Technical articles about infrastructure as code, CDKTF, and cloud
            development.
          </p>
          {/* Blog post list will be rendered here once we implement US4 */}
        </div>
      </BlogLayout>
    );
  }

  // Individual post pages will be handled by separate builds
  // This is a fallback for development
  return (
    <BlogLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Blog Post
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Post content will load here.
        </p>
      </div>
    </BlogLayout>
  );
}

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

export default App;
