import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { BlogLayout } from './components/BlogLayout';

/**
 * SSR Entry Point
 * Renders the blog component tree to a static HTML string.
 */
export async function render(url: string, context: any) {
  const { PostComponent, frontmatter, toc } = context;

  // In a real implementation, we might use a router here if we have multiple pages
  // but for SSG we know exactly which component to render for which URL.
  
  const html = ReactDOMServer.renderToString(
    <React.StrictMode>
      <BlogLayout>
        <PostComponent frontmatter={frontmatter} toc={toc} />
      </BlogLayout>
    </React.StrictMode>
  );

  return html;
}
