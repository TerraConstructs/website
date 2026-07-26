'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * The point of this widget: the *same* call site works for every grantable,
 * because the grant method takes an interface, not a resource type.
 */
const GRANTABLES = [
  {
    id: 'lambda',
    label: 'LambdaFunction',
    expr: 'const target = new LambdaFunction(this, "Worker", { /* … */ })',
    principal: 'aws_iam_role.Worker_ServiceRole',
    note: 'an execution role the function created for itself',
  },
  {
    id: 'ecs',
    label: 'FargateTaskDefinition',
    expr: 'const target = new FargateTaskDefinition(this, "Task", { /* … */ })',
    principal: 'aws_iam_role.Task_TaskRole',
    note: 'a task role, nested two constructs deep',
  },
  {
    id: 'sfn',
    label: 'StateMachine',
    expr: 'const target = new StateMachine(this, "Flow", { definition })',
    principal: 'aws_iam_role.Flow_Role',
    note: 'a role that also aggregates every task in the definition',
  },
  {
    id: 'principal',
    label: 'ArnPrincipal',
    expr: 'const target = new ArnPrincipal("arn:aws:iam::111122223333:role/Ops")',
    principal: 'arn:aws:iam::111122223333:role/Ops',
    note: 'not even a resource in this stack — just an IPrincipal',
  },
]

export function Polymorphism() {
  const [active, setActive] = useState(0)
  const g = GRANTABLES[active]

  return (
    <section className="border-b">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
          <div>
            <span className="label-mono">Where the object graph pays for itself</span>
            <h2 className="mt-4 text-balance text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
              One call site. Any grantable.
            </h2>
            <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
              <code className="font-mono text-[0.8125rem] text-foreground">grantReadWriteData</code>{' '}
              accepts an <code className="font-mono text-[0.8125rem] text-brand">IGrantable</code>.
              It has no idea whether it was handed a function, a task definition, a state machine or
              a bare ARN — it asks for a principal and gets one. Swap the target below; the granting
              line never changes.
            </p>

            <div className="mt-8 flex flex-col gap-1.5" role="tablist" aria-label="Grant target">
              {GRANTABLES.map((item, i) => (
                <button
                  key={item.id}
                  role="tab"
                  aria-selected={i === active}
                  onClick={() => setActive(i)}
                  className={cn(
                    'flex items-center gap-3 rounded-md border px-3 py-2.5 text-left transition-colors',
                    i === active
                      ? 'border-brand/50 bg-brand-muted'
                      : 'border-border hover:border-brand/25 hover:bg-foreground/[0.03]',
                  )}
                >
                  <span
                    className={cn(
                      'size-1.5 shrink-0 rounded-full transition-colors',
                      i === active ? 'bg-brand' : 'bg-muted-foreground/40',
                    )}
                    aria-hidden
                  />
                  <span
                    className={cn(
                      'font-mono text-[0.8125rem]',
                      i === active ? 'text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {item.label}
                  </span>
                  <span className="ml-auto hidden text-right text-xs text-muted-foreground sm:block">
                    {item.note}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="overflow-hidden rounded-lg border bg-surface">
              <div className="flex items-center gap-2 border-b bg-background/40 px-3 py-2">
                <span className="size-1.5 rounded-full bg-brand" aria-hidden />
                <span className="font-mono text-[0.6875rem] text-muted-foreground">
                  src/main.ts
                </span>
              </div>
              <pre className="overflow-x-auto p-4 font-mono text-[0.75rem] leading-[1.7]">
                <code>
                  <span className="text-muted-foreground/60">
                    {'// whatever you construct here…\n'}
                  </span>
                  <span key={g.id} className="block animate-in fade-in duration-300">
                    <span className="text-foreground/90">{g.expr}</span>
                    {'\n'}
                  </span>
                  {'\n'}
                  <span className="text-muted-foreground/60">
                    {'// …this line is identical, every time\n'}
                  </span>
                  <span className="-mx-4 block bg-brand-muted px-4 text-foreground">
                    {'table.grantReadWriteData(target)'}
                  </span>
                </code>
              </pre>
            </div>

            <div className="flex items-center justify-center py-1">
              <span className="label-mono">synthesizes to</span>
            </div>

            <div className="overflow-hidden rounded-lg border bg-surface">
              <div className="flex items-center gap-2 border-b bg-background/40 px-3 py-2">
                <span className="size-1.5 rounded-full bg-doc" aria-hidden />
                <span className="font-mono text-[0.6875rem] text-muted-foreground">
                  cdk.tf.hcl
                </span>
              </div>
              <pre className="overflow-x-auto p-4 font-mono text-[0.75rem] leading-[1.7]">
                <code>
                  <span className="text-doc">{'data'}</span>
                  <span className="text-foreground/70">
                    {' "aws_iam_policy_document" "TableAccess" {\n'}
                  </span>
                  <span className="text-foreground/70">{'  statement {\n'}</span>
                  <span className="text-foreground/70">{'    actions = ['}</span>
                  <span className="text-muted-foreground/70">
                    {'"dynamodb:GetItem", "dynamodb:PutItem", …'}
                  </span>
                  <span className="text-foreground/70">{']\n'}</span>
                  <span className="text-foreground/70">{'    principals = [{\n'}</span>
                  <span className="text-foreground/70">{'      identifiers = ['}</span>
                  <span
                    key={g.id}
                    className="animate-in fade-in duration-300 rounded bg-doc-muted px-1 text-doc"
                  >
                    {g.principal}
                  </span>
                  <span className="text-foreground/70">{']\n'}</span>
                  <span className="text-foreground/70">{'    }]\n  }\n}'}</span>
                </code>
              </pre>
            </div>

            <p className="text-pretty text-xs leading-relaxed text-muted-foreground">
              In a document model, each of those four targets is a different wiring problem, solved
              somewhere outside both resources. Here it is the same method call, resolved by the
              graph.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
