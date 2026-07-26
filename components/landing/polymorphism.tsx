'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

type Kind = 'lazy' | 'wired' | 'existing'

type Res = {
  name: string
  kind: Kind
  note: string
  /** The value that actually gets handed across the interface boundary. */
  identifier?: boolean
}

const KIND_LABEL: Record<Kind, string> = {
  lazy: 'created lazily',
  wired: 'wired up',
  existing: 'already existed',
}

/**
 * The point of this widget: one call site, but the work required to satisfy it
 * differs wildly per implementation — from three chained resources down to none.
 * That gap is what polymorphism is hiding, and what a document model cannot.
 */
const MODES = [
  {
    id: 'grant',
    iface: 'IGrantable',
    tab: 'grant',
    varName: 'target',
    callLine: 'table.grantReadWriteData(target)',
    blurb:
      'and asks it for a principal. What it takes to produce that principal is entirely the implementation’s business — sometimes one role, sometimes three chained resources, sometimes nothing at all.',
    targets: [
      {
        id: 'lambda',
        label: 'LambdaFunction',
        expr: 'const target = new LambdaFunction(this, "Worker", { /* … */ })',
        note: 'one role',
        chain: [
          {
            name: 'aws_iam_role.Worker_ServiceRole',
            kind: 'lazy',
            note: 'execution role, materialized on first use',
            identifier: true,
          },
          {
            name: 'aws_iam_role_policy.Worker_ServiceRole_Default',
            kind: 'wired',
            note: 'the statement this grant contributed',
          },
        ] as Res[],
      },
      {
        id: 'instance',
        label: 'Instance',
        expr: 'const target = new Instance(this, "Box", { instanceType, machineImage })',
        note: 'a role, a profile, an association',
        chain: [
          {
            name: 'aws_iam_role.Box_InstanceRole',
            kind: 'lazy',
            note: 'created the first time anything asks Box for a principal',
            identifier: true,
          },
          {
            name: 'aws_iam_instance_profile.Box_InstanceProfile',
            kind: 'lazy',
            note: 'an EC2 instance cannot hold a role directly — it needs a profile',
          },
          {
            name: 'aws_instance.Box',
            kind: 'wired',
            note: 'iam_instance_profile now points at that profile',
          },
          {
            name: 'aws_iam_role_policy.Box_InstanceRole_Default',
            kind: 'wired',
            note: 'the statement this grant contributed',
          },
        ] as Res[],
      },
      {
        id: 'ecs',
        label: 'FargateTaskDefinition',
        expr: 'const target = new FargateTaskDefinition(this, "Task", { /* … */ })',
        note: 'a task role, nested two constructs deep',
        chain: [
          {
            name: 'aws_iam_role.Task_TaskRole',
            kind: 'lazy',
            note: 'distinct from the execution role, and two constructs down',
            identifier: true,
          },
          {
            name: 'aws_iam_role_policy.Task_TaskRole_Default',
            kind: 'wired',
            note: 'the statement this grant contributed',
          },
        ] as Res[],
      },
      {
        id: 'sfn',
        label: 'StateMachine',
        expr: 'const target = new StateMachine(this, "Flow", { definition })',
        note: 'a role that aggregates its whole definition',
        chain: [
          {
            name: 'aws_iam_role.Flow_Role',
            kind: 'lazy',
            note: 'one role for the machine',
            identifier: true,
          },
          {
            name: 'aws_iam_role_policy.Flow_Role_Default',
            kind: 'wired',
            note: 'every task in the definition bubbled its actions up here, plus this grant',
          },
        ] as Res[],
      },
      {
        id: 'principal',
        label: 'ArnPrincipal',
        expr: 'const target = new ArnPrincipal("arn:aws:iam::111122223333:role/Ops")',
        note: 'not a resource at all',
        chain: [
          {
            name: 'arn:aws:iam::111122223333:role/Ops',
            kind: 'existing',
            note: 'already an identifier — there is nothing to create',
            identifier: true,
          },
        ] as Res[],
      },
    ],
  },
  {
    id: 'connect',
    iface: 'IConnectable',
    tab: 'connect',
    varName: 'source',
    callLine: 'source.connections.allowTo(database, Port.tcp(5432))',
    blurb:
      'and writes rules on both sides — egress on the caller, ingress on the callee. Neither resource had to be told the other exists.',
    targets: [
      {
        id: 'instance',
        label: 'Instance',
        expr: 'const source = new Instance(this, "Box", { instanceType, machineImage })',
        note: 'a group, then a rule on each side',
        chain: [
          {
            name: 'aws_security_group.Box_SecurityGroup',
            kind: 'lazy',
            note: 'created the first time you touch Box.connections',
            identifier: true,
          },
          {
            name: 'aws_vpc_security_group_egress_rule.Box_to_Db',
            kind: 'wired',
            note: 'egress, on the caller’s own group',
          },
          {
            name: 'aws_vpc_security_group_ingress_rule.Db_from_Box',
            kind: 'wired',
            note: 'ingress, written onto the database’s group',
          },
        ] as Res[],
      },
      {
        id: 'fargate',
        label: 'FargateService',
        expr: 'const source = new FargateService(this, "Svc", { taskDefinition })',
        note: 'same shape, different resource',
        chain: [
          {
            name: 'aws_security_group.Svc_SecurityGroup',
            kind: 'lazy',
            note: 'the service’s group, materialized on demand',
            identifier: true,
          },
          {
            name: 'aws_vpc_security_group_egress_rule.Svc_to_Db',
            kind: 'wired',
            note: 'egress, on the caller’s own group',
          },
          {
            name: 'aws_vpc_security_group_ingress_rule.Db_from_Svc',
            kind: 'wired',
            note: 'ingress, written onto the database’s group',
          },
        ] as Res[],
      },
      {
        id: 'peer',
        label: 'Peer.ipv4',
        expr: 'const source = Peer.ipv4("10.0.0.0/16")',
        note: 'no group to put a rule on',
        chain: [
          {
            name: '10.0.0.0/16',
            kind: 'existing',
            note: 'a CIDR is already an identifier',
            identifier: true,
          },
          {
            name: 'aws_vpc_security_group_ingress_rule.Db_from_Cidr',
            kind: 'wired',
            note: 'cidr_ipv4 rule — there is no caller-side group to write to',
          },
        ] as Res[],
      },
    ],
  },
]

export function Polymorphism() {
  const [mode, setMode] = useState(0)
  const [active, setActive] = useState(0)
  const m = MODES[mode]
  const t = m.targets[active]

  return (
    <section className="border-b">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-14">
          <div>
            <span className="label-mono">Where the object graph pays for itself</span>
            <h2 className="mt-4 text-balance text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
              One call site. Whatever it takes underneath.
            </h2>
            <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
              <code className="font-mono text-[0.8125rem] text-foreground">{m.callLine}</code>
            </p>
            <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
              It accepts an{' '}
              <code className="font-mono text-[0.8125rem] text-brand">{m.iface}</code>
              {' '}
              {m.blurb}
            </p>

            <div
              className="mt-6 inline-flex rounded-lg border p-1"
              role="tablist"
              aria-label="Capability interface"
            >
              {MODES.map((item, i) => (
                <button
                  key={item.id}
                  role="tab"
                  aria-selected={i === mode}
                  onClick={() => {
                    setMode(i)
                    setActive(0)
                  }}
                  className={cn(
                    'rounded-md px-3 py-1.5 font-mono text-xs transition-colors',
                    i === mode
                      ? 'bg-brand-muted text-brand'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {item.iface}
                </button>
              ))}
            </div>

            <div className="mt-4 flex flex-col gap-1.5" role="tablist" aria-label="Implementation">
              {m.targets.map((item, i) => (
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
                <span className="font-mono text-[0.6875rem] text-muted-foreground">src/main.ts</span>
              </div>
              <pre className="overflow-x-auto p-4 font-mono text-[0.75rem] leading-[1.7]">
                <code>
                  <span className="text-muted-foreground/60">
                    {'// whatever you construct here…\n'}
                  </span>
                  <span key={t.id} className="block animate-in fade-in duration-300">
                    <span className="text-foreground/90">{t.expr}</span>
                    {'\n'}
                  </span>
                  {'\n'}
                  <span className="text-muted-foreground/60">
                    {'// …this line never changes\n'}
                  </span>
                  <span className="-mx-4 block bg-brand-muted px-4 text-foreground">
                    {m.callLine}
                  </span>
                </code>
              </pre>
            </div>

            <div className="flex items-center justify-center gap-2 py-1">
              <span className="label-mono">synthesizes to</span>
              <span className="font-mono text-[0.6875rem] tabular-nums text-brand">
                {t.chain.length} {t.chain.length === 1 ? 'address' : 'addresses'}
              </span>
            </div>

            <div className="overflow-hidden rounded-lg border bg-surface">
              <div className="flex items-center gap-2 border-b bg-background/40 px-3 py-2">
                <span className="size-1.5 rounded-full bg-doc" aria-hidden />
                <span className="font-mono text-[0.6875rem] text-muted-foreground">cdk.tf.hcl</span>
              </div>
              <ol key={`${m.id}-${t.id}`} className="animate-in fade-in duration-300">
                {t.chain.map((res, i) => (
                  <li
                    key={res.name}
                    className={cn(
                      'flex gap-3 px-4 py-3',
                      i > 0 && 'border-t border-border/60',
                      res.identifier && 'bg-doc-muted/40',
                    )}
                  >
                    <span className="mt-1 font-mono text-[0.625rem] tabular-nums text-muted-foreground/50">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            'break-all font-mono text-[0.75rem]',
                            res.identifier ? 'text-doc' : 'text-foreground/80',
                          )}
                        >
                          {res.name}
                        </span>
                        <span
                          className={cn(
                            'shrink-0 rounded border px-1.5 py-0.5 font-mono text-[0.5625rem] uppercase tracking-wide',
                            res.kind === 'lazy' && 'border-brand/40 text-brand',
                            res.kind === 'wired' && 'border-doc/40 text-doc',
                            res.kind === 'existing' &&
                              'border-border text-muted-foreground/70',
                          )}
                        >
                          {KIND_LABEL[res.kind]}
                        </span>
                      </div>
                      <p className="mt-1 text-pretty text-xs leading-relaxed text-muted-foreground">
                        {res.note}
                        {res.identifier && (
                          <span className="text-doc">
                            {' '}
                            — this is the identifier that crosses the interface
                          </span>
                        )}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <p className="text-pretty text-xs leading-relaxed text-muted-foreground">
              Note how little the call site knows. It never named a role, a profile, a security
              group or a rule — and for{' '}
              <code className="font-mono text-[0.6875rem]">
                {m.id === 'grant' ? 'ArnPrincipal' : 'Peer.ipv4'}
              </code>{' '}
              there was no resource to name at all. In a document model each of these is a separate
              wiring problem, solved outside both parties. Here it is one method, resolved by the
              graph.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
