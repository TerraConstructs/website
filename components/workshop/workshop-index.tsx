import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { WORKSHOPS } from '@/lib/workshops'
import { cn } from '@/lib/utils'

/** The /workshops landing page: one card per cloud, only AWS is live. */
export function WorkshopIndex() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24">
      <p className="label-mono">Workshops</p>
      <h1 className="mt-4 text-balance text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
        Learn TerraConstructs by building
      </h1>
      <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
        Hands-on workshops that take you from an empty directory to deployed infrastructure — using
        typed constructs on top of Terraform.
      </p>

      <ul className="mt-12 flex flex-col gap-4">
        {WORKSHOPS.map((workshop) => {
          const card = (
            <div
              className={cn(
                'flex items-start gap-4 rounded-xl border p-6 transition-colors',
                workshop.available ? 'group hover:border-brand/40' : 'opacity-60',
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2
                    className={cn(
                      'text-lg font-medium',
                      workshop.available && 'group-hover:text-brand',
                    )}
                  >
                    {workshop.name}
                  </h2>
                  {workshop.available ? null : (
                    <span className="label-mono rounded-full border px-2 py-0.5 text-[0.625rem]">
                      Soon
                    </span>
                  )}
                </div>
                <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
                  {workshop.description}
                </p>
              </div>
              {workshop.available ? (
                <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-brand" />
              ) : null}
            </div>
          )

          return (
            <li key={workshop.id}>
              {workshop.available ? (
                <Link href={`/workshops/${workshop.id}`}>{card}</Link>
              ) : (
                <div aria-disabled>{card}</div>
              )}
            </li>
          )
        })}
      </ul>
    </main>
  )
}
