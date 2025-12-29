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
 * @param mdxModule - The loaded MDX module with Content, frontmatter, toc, readingTime
 * @param slug - The post slug (folder name)
 * @param hasAudio - Whether audio is available on CDN (build-time detected)
 */
export function renderPost(mdxModule: any, slug: string, hasAudio: boolean = false) {
  const { default: Content, frontmatter, toc, readingTime } = mdxModule;

  const html = ReactDOMServer.renderToString(
    <React.StrictMode>
      <MDXProvider components={mdxComponents}>
        <PostPage
          frontmatter={frontmatter}
          toc={toc || []}
          readingTime={readingTime}
          slug={slug}
          hasAudio={hasAudio}
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
