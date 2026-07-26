'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

const ROWS = [
  {
    aspect: 'The unit',
    doc: 'A module — a directory of files.',
    obj: 'A construct — a class you can instantiate.',
  },
  {
    aspect: 'Its interface',
    doc: 'Exactly its variables and outputs. A shape, checked late.',
    obj: 'A TypeScript type. Checked before you ever run a plan.',
  },
  {
    aspect: 'Composition',
    doc: 'Nest a module, then re-declare every variable you want to pass through.',
    obj: 'Pass the object. It carries its own behaviour with it.',
  },
  {
    aspect: 'Reuse',
    doc: 'Copy the block, change the strings. Or a for_each and a lookup map.',
    obj: 'Subclass it, or wrap it in a construct that means something to your team.',
  },
  {
    aspect: 'Cross-cutting concerns',
    doc: 'Something outside both resources must know about both and wire the rule.',
    obj: 'One asks the other for a grant. Neither needs to know what the other is.',
  },
  {
    aspect: 'Where logic lives',
    doc: 'In the templating layer: locals, ternaries, try(), merge(), jsonencode().',
    obj: 'In methods, on the object that owns the invariant.',
  },
]

const MISCONCEPTION = {
  wrong: 'declarative vs. imperative',
  right: 'document-oriented vs. object-oriented',
}

export function DocumentsVsObjects() {
  const [active, setActive] = useState<number | null>(null)

  return (
    <section id="documents-vs-objects" className="scroll-mt-16 border-b">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <span className="label-mono">The actual distinction</span>

        <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
          <div>
            <h2 className="text-balance text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
              It was never declarative versus imperative.
            </h2>

            <div className="mt-6 space-y-4 text-pretty leading-relaxed text-muted-foreground">
              <p>
                HCL and a CDK program are both declarative. Both describe a desired end state; both
                hand that description to an engine that figures out how to get there. A{' '}
                <code className="font-mono text-[0.8125rem] text-foreground">for</code> loop that
                builds a list of subnets is no less declarative than a{' '}
                <code className="font-mono text-[0.8125rem] text-foreground">for_each</code> that
                does the same thing.
              </p>
              <p className="text-foreground">
                The real split is{' '}
                <span className="font-medium text-doc">how infrastructure is modelled</span>: as a{' '}
                <span className="font-medium text-doc">document</span> to be merged, looked up and
                templated — or as{' '}
                <span className="font-medium text-brand">typed objects with behaviour</span>.
              </p>
            </div>

            <figure className="mt-8 border-l-2 border-brand/50 pl-5">
              <blockquote className="space-y-3 text-pretty text-sm leading-relaxed text-muted-foreground">
                <p>
                  A Terraform module&apos;s interface is exactly its variables and outputs — it&apos;s
                  a document, not a type. Two resources can&apos;t hand each other permission to
                  talk; something has to sit outside both and wire up the rule.
                </p>
                <p>
                  In an object-oriented model, that wiring{' '}
                  <em className="italic text-foreground">is</em>
                  {' the object graph. A construct that implements a capability interface — '}
                  {'TerraConstructs’ port of AWS CDK’s '}
                  <code className="font-mono text-[0.8125rem] text-brand">IConnectable</code>,{' '}
                  <code className="font-mono text-[0.8125rem] text-brand">IGrantable</code> and{' '}
                  <code className="font-mono text-[0.8125rem] text-brand">IPrincipal</code>
                  {' — '}can be handed to any other construct&apos;s connection or grant method,
                  regardless of what either one actually is underneath.
                </p>
                <p className="text-foreground">
                  That&apos;s polymorphism, and a document has no place to put it.
                </p>
              </blockquote>
            </figure>

            <div className="mt-8 flex flex-wrap items-center gap-2 font-mono text-xs">
              <span className="text-muted-foreground line-through decoration-muted-foreground/50">
                {MISCONCEPTION.wrong}
              </span>
              <span className="text-muted-foreground/50">→</span>
              <span className="rounded bg-brand-muted px-2 py-1 text-brand">
                {MISCONCEPTION.right}
              </span>
            </div>
          </div>

          {/* comparison table */}
          <div className="overflow-hidden rounded-xl border bg-card/40">
            <div className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1fr)] border-b bg-background/40">
              <div className="px-3 py-2.5 sm:px-4">
                <span className="label-mono">Aspect</span>
              </div>
              <div className="flex items-center gap-1.5 border-l px-3 py-2.5 sm:px-4">
                <span className="size-1.5 rounded-full bg-doc" aria-hidden />
                <span className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-doc">
                  Document
                </span>
              </div>
              <div className="flex items-center gap-1.5 border-l px-3 py-2.5 sm:px-4">
                <span className="size-1.5 rounded-full bg-brand" aria-hidden />
                <span className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-brand">
                  Object
                </span>
              </div>
            </div>

            <ul>
              {ROWS.map((row, i) => (
                <li
                  key={row.aspect}
                  onMouseEnter={() => setActive(i)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                  tabIndex={0}
                  className={cn(
                    'grid grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1fr)] border-b outline-none transition-colors last:border-b-0',
                    active === i ? 'bg-foreground/[0.04]' : 'bg-transparent',
                  )}
                >
                  <div className="px-3 py-3.5 text-[0.8125rem] font-medium sm:px-4">
                    {row.aspect}
                  </div>
                  <div
                    className={cn(
                      'border-l px-3 py-3.5 text-[0.8125rem] leading-relaxed transition-colors sm:px-4',
                      active === i ? 'text-foreground/80' : 'text-muted-foreground',
                    )}
                  >
                    {row.doc}
                  </div>
                  <div
                    className={cn(
                      'border-l px-3 py-3.5 text-[0.8125rem] leading-relaxed transition-colors sm:px-4',
                      active === i ? 'text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {row.obj}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
