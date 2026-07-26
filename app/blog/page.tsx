import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { formatDate, getAllPosts } from '@/lib/blog'

export const metadata: Metadata = {
  title: 'Blog — TerraConstructs',
  description:
    'Notes on object-oriented infrastructure, the CDK programming model, and TerraConstructs development.',
}

export default async function BlogIndexPage() {
  const posts = await getAllPosts()

  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <span className="label-mono">Blog</span>
      <h1 className="mt-4 text-balance text-4xl font-medium tracking-tight sm:text-5xl">
        Notes from the build
      </h1>
      <p className="mt-5 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
        Design notes on modelling infrastructure as typed objects, what we learned porting the AWS
        CDK to Terraform, and where TerraConstructs is heading.
      </p>

      <ul className="mt-14 flex flex-col">
        {posts.map((post) => (
          <li key={post.slug} className="border-t">
            <Link
              href={`/blog/${post.slug}`}
              className="group flex flex-col gap-3 py-8 transition-opacity hover:opacity-100"
            >
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

              <h2 className="text-pretty text-xl font-medium tracking-tight transition-colors group-hover:text-brand sm:text-2xl">
                {post.title}
              </h2>

              <p className="max-w-2xl text-pretty leading-relaxed text-muted-foreground">
                {post.description}
              </p>

              <span className="mt-1 flex items-center gap-1.5 text-sm font-medium text-brand">
                Read
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
