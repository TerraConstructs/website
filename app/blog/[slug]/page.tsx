import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import rehypeSlug from 'rehype-slug'
import { ArrowLeft } from 'lucide-react'
import { formatDate, getPost, getPostSlugs } from '@/lib/blog'
import { mdxComponents } from '@/components/blog/mdx-components'
import { TableOfContents } from '@/components/blog/table-of-contents'
import { LINKS } from '@/lib/links'

export async function generateStaticParams() {
  const slugs = await getPostSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return {}

  return {
    title: `${post.title} — TerraConstructs`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      authors: post.authors,
    },
  }
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3" />
        All posts
      </Link>

      <div className="mt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_14rem] lg:gap-12">
        <article>
          <header className="border-b pb-8">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.6875rem] text-muted-foreground">
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <span aria-hidden>·</span>
              <span>{post.readingMinutes} min read</span>
              {post.tags.length > 0 ? (
                <>
                  <span aria-hidden>·</span>
                  <span className="text-brand">{post.tags.join(', ')}</span>
                </>
              ) : null}
            </div>

            <h1 className="mt-4 text-balance text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
              {post.title}
            </h1>

            {post.description ? (
              <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
                {post.description}
              </p>
            ) : null}

            {post.authors.length > 0 ? (
              <p className="mt-5 font-mono text-[0.6875rem] text-muted-foreground">
                by {post.authors.join(', ')}
              </p>
            ) : null}
          </header>

          {/* ToC inline on small screens, where the sidebar is hidden */}
          <div className="border-b py-6 lg:hidden">
            <TableOfContents headings={post.headings} />
          </div>

          <div className="pb-4">
            <MDXRemote
              source={post.content}
              components={mdxComponents}
              options={{ mdxOptions: { rehypePlugins: [rehypeSlug] } }}
            />
          </div>

          <footer className="mt-14 rounded-lg border bg-card/40 p-6">
            <h2 className="text-base font-medium">Questions, or want to help?</h2>
            <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
              TerraConstructs is Apache-2.0 and built in the open. The fastest way to get help is
              the CDK community Slack.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href={LINKS.cdkDev}
                target="_blank"
                rel="noreferrer"
                className="rounded-md bg-brand px-3.5 py-2 text-sm font-medium text-brand-foreground transition-opacity hover:opacity-90"
              >
                Join cdk.dev
              </a>
              <a
                href={LINKS.github}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border px-3.5 py-2 text-sm font-medium transition-colors hover:border-brand/40"
              >
                Contribute on GitHub
              </a>
            </div>
          </footer>
        </article>

        {/* floating ToC */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
            <TableOfContents headings={post.headings} />
          </div>
        </aside>
      </div>
    </main>
  )
}
