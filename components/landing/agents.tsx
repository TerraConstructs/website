'use client'

import { useState } from 'react'
import { Play, RotateCcw, Coins, Braces, ShieldCheck, TriangleAlert } from 'lucide-react'

type Verdict = 'derived' | 'encoded' | 'remains'

/**
 * Every entry below is from a real run log: a hand-authored least-privilege IAM
 * policy for a CI role deploying a single-instance Atlantis module. Each line
 * cost one ~20 minute CI cycle (AMI build + apply + destroy) to discover.
 */
const ITERATIONS: {
  missing: string
  why: string
  verdict: Verdict
}[] = [
  {
    missing: 'ec2:ModifyImageAttribute',
    why: 'Packer sets ami_description after create — not just for sharing.',
    verdict: 'remains',
  },
  {
    missing: 'All of S3',
    why: 'The module flag tfmigrate_enabled = true creates a bucket. Invisible unless you read module internals.',
    verdict: 'derived',
  },
  {
    missing: 'iam:ListRoleTags, iam:CreateServiceLinkedRole',
    why: 'Refresh-time reads, not anything in the plan.',
    verdict: 'remains',
  },
  {
    missing: 'route53:ListTagsForResource',
    why: 'The aws_route53_zone data source reads tags.',
    verdict: 'derived',
  },
  {
    missing: 'route53:GetChange scoped to zone ARN',
    why: 'The action does not support resource-level permissions, so scoping it is a permanent deny.',
    verdict: 'encoded',
  },
  {
    missing: 'iam:TagInstanceProfile',
    why: 'default_tags makes tag-on-create part of CreateInstanceProfile.',
    verdict: 'derived',
  },
  {
    missing: 'All of KMS',
    why: 'SecureString parameters and encrypted = true volumes.',
    verdict: 'derived',
  },
  {
    missing: 'ec2:GetSecurityGroupsForVpc',
    why: 'ec2:Describe* does not cover ec2:Get*.',
    verdict: 'encoded',
  },
  {
    missing: 's3:DeleteBucketOwnershipControls',
    why: 'Not a real IAM action. IAM accepts invalid names silently — it reads as granted and matches nothing.',
    verdict: 'encoded',
  },
  {
    missing: 'ssm:GetInventory',
    why: 'Required by terratest’s WaitForSsmInstance assertion.',
    verdict: 'remains',
  },
  {
    missing: 'arn:aws:s3:::e2e-*',
    why: 'The wildcard also matched the shared tfstate bucket — a PR-assumable role could delete its own state.',
    verdict: 'derived',
  },
]

const VERDICT_META: Record<Verdict, { label: string; tone: string }> = {
  derived: {
    label: 'derived from the graph',
    tone: 'bg-brand-muted text-brand',
  },
  encoded: {
    label: 'encoded in the library',
    tone: 'bg-brand-muted text-brand',
  },
  remains: {
    label: 'still yours to write',
    tone: 'bg-doc-muted text-doc',
  },
}

const MINUTES_PER_CYCLE = 20

const PILLARS = [
  {
    icon: Coins,
    title: 'The loop is the line item',
    body: 'A model that cannot know an action exists has to discover it by failing. Every discovery is a full apply, a parsed error, a re-plan and a re-validate — context re-read from scratch each time. That is where the budget goes, and it buys knowledge thousands of teams have already paid for.',
  },
  {
    icon: Braces,
    title: 'Intent-oriented, not resource-oriented',
    body: 'grantReadWrite is a decision. Thirty-one policy actions across four services is a transcription. Models are markedly more reliable choosing among a few well-typed intents than emitting hundreds of interdependent low-level fields, and a typed surface makes an invalid action a compile error rather than a silent no-op.',
  },
  {
    icon: ShieldCheck,
    title: 'Deterministic and already tested',
    body: 'The constructs are end-to-end tested and synthesis is deterministic: the same program yields the same HCL, so an agent’s output is reviewable as a diff. The library carries the AWS trivia — which actions ignore resource scoping, which APIs tag on create — so nobody rediscovers it per repository.',
  },
]

export function Agents() {
  const [revealed, setRevealed] = useState(0)

  const done = revealed >= ITERATIONS.length
  const eliminated = ITERATIONS.filter((i) => i.verdict !== 'remains').length

  return (
    <section id="agents" className="scroll-mt-16 border-b bg-card/30">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="max-w-2xl">
          <span className="label-mono">Why this matters now</span>
          <h2 className="mt-4 text-balance text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
            The cheapest tokens are the ones you never spend.
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            The constraint on adopting AI in 2026 is not access to frontier models — it is what they
            cost to run. Plenty of organisations spent an annual budget in six months and are now
            re-forecasting. So the question stops being “can an agent do this?” and becomes “how much
            iteration does this task require before it converges?”
          </p>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            An agent can absolutely author raw provider configuration for every resource. It will
            just have to validate its way there.
          </p>
        </div>

        {/* The loop */}
        <div className="mt-12 overflow-hidden rounded-xl border bg-background">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-surface px-4 py-3">
            <div className="flex items-center gap-2.5">
              <TriangleAlert className="size-4 text-doc" />
              <span className="font-mono text-xs text-muted-foreground">
                least-privilege IAM policy, authored by reading the module
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                {revealed}/{ITERATIONS.length} found
                <span className="mx-2 text-border">|</span>
                <span className={revealed > 0 ? 'text-doc' : ''}>
                  ~{revealed * MINUTES_PER_CYCLE} min CI
                </span>
              </span>
              {done ? (
                <button
                  type="button"
                  onClick={() => setRevealed(0)}
                  className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 font-mono text-xs transition-colors hover:bg-card"
                >
                  <RotateCcw className="size-3" />
                  Reset
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setRevealed((r) => r + 1)}
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1.5 font-mono text-xs text-primary-foreground transition-opacity hover:opacity-90"
                >
                  <Play className="size-3" />
                  {revealed === 0 ? 'Run the loop' : 'Next cycle'}
                </button>
              )}
            </div>
          </div>

          <div className="divide-y">
            {revealed === 0 && (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground sm:px-6">
                Policy written by enumerating what the module “obviously” needs.
                <br className="hidden sm:inline" /> Step through what a real deployment actually
                demanded.
              </p>
            )}

            {ITERATIONS.slice(0, revealed).map((item, i) => {
              const meta = VERDICT_META[item.verdict]
              return (
                <div key={item.missing} className="flex gap-3 px-4 py-4 sm:gap-4 sm:px-6">
                  <span className="mt-0.5 font-mono text-xs tabular-nums text-muted-foreground">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                      <span className="font-mono text-xs text-doc">AccessDenied</span>
                      <code className="break-all font-mono text-sm text-foreground">
                        {item.missing}
                      </code>
                    </div>
                    <p className="mt-1.5 text-pretty text-sm leading-relaxed text-muted-foreground">
                      {item.why}
                    </p>
                  </div>
                  <span
                    className={`mt-0.5 hidden shrink-0 self-start rounded px-2 py-1 font-mono text-[0.6875rem] leading-none sm:inline-block ${meta.tone}`}
                  >
                    {meta.label}
                  </span>
                </div>
              )
            })}
          </div>

          {done && (
            <div className="border-t bg-surface px-4 py-5 sm:px-6">
              <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                <span className="text-foreground">
                  Eleven cycles, roughly {(ITERATIONS.length * MINUTES_PER_CYCLE) / 60} hours of CI
                  wall-clock
                </span>{' '}
                — and the empirical shortcut had holes too. Replaying 555 CloudTrail events from a
                successful run still missed <code className="font-mono">iam:TagInstanceProfile</code>
                , because CloudTrail does not log tag-on-create authorizations. And{' '}
                <code className="font-mono">simulate-principal-policy</code> reports{' '}
                <code className="font-mono">implicitDeny</code> for anything behind a condition key
                unless you pass <code className="font-mono">--context-entries</code>, producing false
                alarms on <code className="font-mono">iam:PassRole</code> and{' '}
                <code className="font-mono">kms:ViaService</code>.
              </p>
              <p className="mt-3 text-pretty text-sm leading-relaxed">
                <span className="text-brand">{eliminated} of {ITERATIONS.length}</span>
                <span className="text-muted-foreground">
                  {' '}
                  never surface in a construct program — the grant is derived from the object graph,
                  or the quirk is already encoded in the library. The remaining{' '}
                  {ITERATIONS.length - eliminated} come from outside the graph — Packer, provider
                  refresh reads, test assertions — and those are still yours.
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Contrast */}
        <div className="mt-6 grid gap-px overflow-hidden rounded-xl border bg-border lg:grid-cols-2">
          <div className="bg-background p-5 sm:p-6">
            <span className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-doc">
              Enumerated by hand or by agent
            </span>
            <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground">
              Every action, every resource ARN, every condition key — transcribed, then corrected
              against reality one denial at a time. Nothing about the policy states{' '}
              <em className="italic">why</em>
              {' any of it is there.'}
            </p>
            <pre className="mt-4 overflow-x-auto rounded-md border bg-surface p-3 font-mono text-xs leading-relaxed text-foreground/80">
              <code>{`{
  "Action": [
    "s3:GetObject",
    "s3:PutObject",
    "s3:DeleteObject",
    "s3:ListBucket",
    "kms:Decrypt",
    "kms:GenerateDataKey",
    /* … 25 more, some invalid, */
    /* one wildcard too broad  */
  ]
}`}</code>
            </pre>
          </div>

          <div className="bg-background p-5 sm:p-6">
            <span className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-brand">
              Derived from intent
            </span>
            <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground">
              The constructs already know they are encrypted, already know their own ARNs. The agent
              picks an intent; the library owns the transcription — and the KMS grant nobody
              remembered comes along with it.
            </p>
            <pre className="mt-4 overflow-x-auto rounded-md border bg-surface p-3 font-mono text-xs leading-relaxed text-foreground/80">
              <code>{`const state = new Bucket(this, "TfMigrate", {
  encryption: BucketEncryption.KMS,
});
const config = new StringParameter(this, "Cfg", {
  secure: true,
});

state.grantReadWrite(deployRole);
config.grantRead(deployRole);`}</code>
            </pre>
          </div>
        </div>

        {/* Pillars */}
        <div className="mt-6 grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-3">
          {PILLARS.map((p) => {
            const Icon = p.icon
            return (
              <div key={p.title} className="flex flex-col gap-3 bg-background p-6">
                <span className="flex size-8 items-center justify-center rounded-md bg-brand-muted text-brand">
                  <Icon className="size-4" />
                </span>
                <h3 className="text-base font-medium tracking-tight">{p.title}</h3>
                <p className="text-pretty text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </div>
            )
          })}
        </div>

        <p className="mx-auto mt-10 max-w-2xl text-pretty text-center leading-relaxed text-muted-foreground">
          Spend the context window on the problem nobody has solved yet — not on re-validating what
          every other infrastructure team has already re-validated, one denial at a time.
        </p>
      </div>
    </section>
  )
}
