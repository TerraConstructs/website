/**
 * SSR Entry Point for Blog Prerendering
 * Renders blog pages to static HTML strings using ReactDOMServer.
 */
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { MDXProvider } from '@mdx-js/react';
import { PostPage, mdxComponents } from './components/PostPage';
import { BlogIndex } from './components/BlogIndex';

/**
 * Render a blog post page to HTML string.
 */
export function renderPost(mdxModule: any) {
  const { default: Content, frontmatter, toc, readingTime } = mdxModule;

  const html = ReactDOMServer.renderToString(
    <React.StrictMode>
      <MDXProvider components={mdxComponents}>
        <PostPage
          frontmatter={frontmatter}
          toc={toc || []}
          readingTime={readingTime}
        >
          <Content />
        </PostPage>
      </MDXProvider>
    </React.StrictMode>
  );

  return html;
}

/**
 * Render the blog index page to HTML string.
 */
export function renderIndex() {
  const html = ReactDOMServer.renderToString(
    <React.StrictMode>
      <BlogIndex />
    </React.StrictMode>
  );

  return html;
}
