import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import rehypeSlug from 'rehype-slug'
import { ChevronRight, Pencil } from 'lucide-react'
import {
  getAllWorkshopParams,
  getWorkshopPage,
  getWorkshopTree,
  type WorkshopId,
} from '@/lib/workshops'
import { rehypeCodeMeta } from '@/lib/rehype-code-meta'
import { mdxComponents } from '@/components/blog/mdx-components'
import { TableOfContents } from '@/components/blog/table-of-contents'
import { WorkshopSidebar } from '@/components/workshop/workshop-sidebar'
import { PrevNext } from '@/components/workshop/prev-next'
import { ChildrenList } from '@/components/workshop/children-list'
import { WorkshopImage } from '@/components/workshop/workshop-image'
import { WorkshopIndex } from '@/components/workshop/workshop-index'

type Params = { slug?: string[] }

export async function generateStaticParams() {
  // the bare /workshops index is the `slug: []` case
  return [{ slug: [] as string[] }, ...(await getAllWorkshopParams())]
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug = [] } = await params
  if (slug.length === 0) {
    return {
      title: 'Workshops — TerraConstructs',
      description:
        'Hands-on workshops for building cloud infrastructure with TerraConstructs and CDKTN.',
    }
  }

  const page = await getWorkshopPage(slug)
  if (!page) return {}

  return {
    title: `${page.title} — TerraConstructs Workshop`,
    description: page.description,
    openGraph: { title: page.title, description: page.description, type: 'article' },
  }
}

export default async function WorkshopPage({ params }: { params: Promise<Params> }) {
  const { slug = [] } = await params
  if (slug.length === 0) return <WorkshopIndex />

  const [page, tree] = await Promise.all([
    getWorkshopPage(slug),
    getWorkshopTree(slug[0] as WorkshopId),
  ])
  if (!page || !tree) notFound()

  // ChildrenList needs to know which section is rendering it; MDX has no route
  // context, so it is bound per page here.
  const components = {
    ...mdxComponents,
    ChildrenList: () => <ChildrenList segments={slug} />,
    img: WorkshopImage,
  }

  return (
    <main className="mx-auto max-w-[88rem] px-4 py-10 sm:px-6">
      <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[15rem_minmax(0,1fr)_14rem] xl:gap-12">
        <aside className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pb-8">
            <WorkshopSidebar tree={tree} />
          </div>
        </aside>

        <article className="min-w-0">
          <nav aria-label="Breadcrumb" className="label-mono flex flex-wrap items-center gap-1.5">
            <Link href="/workshops" className="transition-colors hover:text-foreground">
              Workshops
            </Link>
            {page.breadcrumbs.map((crumb) => (
              <span key={crumb.href} className="flex items-center gap-1.5">
                <ChevronRight className="size-3" aria-hidden />
                <Link href={crumb.href} className="transition-colors hover:text-foreground">
                  {crumb.title}
                </Link>
              </span>
            ))}
          </nav>

          <h1 className="mt-4 text-balance text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
            {page.title}
          </h1>

          {/* ToC inline on small screens, where the aside is hidden */}
          <div className="mt-6 border-y py-6 xl:hidden">
            <TableOfContents headings={page.headings} />
          </div>

          <div className="pb-4">
            <MDXRemote
              source={page.content}
              components={components}
              options={{ mdxOptions: { rehypePlugins: [rehypeSlug, rehypeCodeMeta] } }}
            />
          </div>

          <PrevNext prev={page.prev} next={page.next} />

          <a
            href={page.editUrl}
            target="_blank"
            rel="noreferrer"
            className="label-mono mt-6 inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
          >
            <Pencil className="size-3" />
            Edit this page
          </a>
        </article>

        <aside className="hidden xl:block">
          <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
            <TableOfContents headings={page.headings} />
          </div>
        </aside>
      </div>
    </main>
  )
}
