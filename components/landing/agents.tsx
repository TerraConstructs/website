'use client'

import { useEffect, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { cn } from '@/lib/utils'

type Kind = 'turn' | 'policy' | 'code' | 'apply' | 'synth' | 'denied' | 'derived' | 'passed'

type Row = {
  kind: Kind
  /** Overrides the kind as the left-hand label, e.g. "turn 3". */
  label?: string
  text: string
  sub?: string
}

const KIND_STYLE: Record<Kind, { bar: string; label: string; text: string; mono?: boolean }> = {
  turn: { bar: 'border-muted-foreground/40', label: 'text-muted-foreground', text: 'text-foreground' },
  policy: { bar: 'border-doc', label: 'text-doc', text: 'text-doc', mono: true },
  code: { bar: 'border-doc', label: 'text-doc', text: 'text-doc', mono: true },
  apply: { bar: 'border-warning', label: 'text-warning', text: 'text-foreground' },
  synth: { bar: 'border-warning', label: 'text-warning', text: 'text-foreground' },
  denied: { bar: 'border-destructive', label: 'text-destructive', text: 'text-destructive', mono: true },
  derived: { bar: 'border-brand', label: 'text-brand', text: 'text-foreground' },
  passed: { bar: 'border-brand', label: 'text-brand', text: 'text-foreground' },
}

/**
 * The same task run twice: a least-privilege deploy role for a KMS-encrypted
 * state bucket and a SecureString config parameter. Token totals are cumulative
 * per turn — each retry re-reads the whole context.
 */
const RAW: { tokens: number; rows: Row[] }[] = [
  {
    tokens: 58_000,
    rows: [
      { kind: 'turn', label: 'turn 1', text: 'Read the module, enumerate what the deploy role obviously needs.' },
      { kind: 'policy', text: '"Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]' },
      { kind: 'apply', text: 'tofu apply · full end-to-end deploy', sub: 'plan + apply + smoke test · 4m 12s' },
      { kind: 'denied', text: 'AccessDenied: s3:ListBucket on arn:aws:s3:::tf-state-prod' },
    ],
  },
  {
    tokens: 132_000,
    rows: [
      { kind: 'turn', label: 'turn 2', text: 'Add ListBucket on the bucket ARN, re-run.' },
      { kind: 'apply', text: 'tofu apply · full end-to-end deploy', sub: '4m 03s · context re-read from scratch' },
      { kind: 'denied', text: 'AccessDenied: kms:Decrypt — the bucket is SSE-KMS' },
    ],
  },
  {
    tokens: 201_000,
    rows: [
      { kind: 'turn', label: 'turn 3', text: 'Add kms:Decrypt scoped to the bucket key.' },
      { kind: 'apply', text: 'tofu apply · full end-to-end deploy', sub: '4m 09s · context re-read from scratch' },
      { kind: 'denied', text: 'AccessDenied: kms:GenerateDataKey — PutObject needs a data key' },
    ],
  },
  {
    tokens: 268_000,
    rows: [
      { kind: 'turn', label: 'turn 4', text: 'Add GenerateDataKey on the same key.' },
      { kind: 'apply', text: 'tofu apply · full end-to-end deploy', sub: '4m 15s · context re-read from scratch' },
      { kind: 'denied', text: 'AccessDenied: ssm:GetParameter on parameter/deploy/config' },
    ],
  },
  {
    tokens: 343_000,
    rows: [
      { kind: 'turn', label: 'turn 5', text: 'Grant GetParameter on the config parameter.' },
      { kind: 'apply', text: 'tofu apply · full end-to-end deploy', sub: '4m 01s · context re-read from scratch' },
      { kind: 'denied', text: 'AccessDenied: kms:Decrypt — the SecureString uses a second key' },
    ],
  },
  {
    tokens: 422_000,
    rows: [
      { kind: 'turn', label: 'turn 6', text: 'Widen kms:Decrypt to key/* so the run stops failing.' },
      { kind: 'apply', text: 'tofu apply · full end-to-end deploy', sub: '4m 07s · context re-read from scratch' },
      { kind: 'passed', text: 'Converged — six deploys later, with a key wildcard someone now has to review out.' },
    ],
  },
]

const L2_TOKENS = 44_000

const L2: Row[] = [
  { kind: 'turn', label: 'turn 1', text: 'State the intent against the constructs that already exist.' },
  { kind: 'code', text: 'state.grantReadWrite(deployRole);\nconfig.grantRead(deployRole);' },
  { kind: 'synth', text: 'cdktn synth · diff reviewed locally', sub: '8s · no cloud call' },
  {
    kind: 'derived',
    text: '11 actions across s3, kms and ssm, derived from the graph — including both KMS keys and the data-key grant nobody remembered.',
  },
  { kind: 'apply', text: 'tofu apply · full end-to-end deploy', sub: '4m 06s · first attempt' },
  { kind: 'passed', text: 'Converged — same 11 actions, one deploy, no wildcard to review out.' },
]

/** Left-hand rows flattened into one timeline, each tagged with its turn. */
const TIMELINE = RAW.flatMap((turn, t) => turn.rows.map((row) => ({ row, turn: t })))

const STEP_MS = 900
const HOLD_MS = 4500

const CARDS = [
  {
    title: 'Intent, not resources',
    body: (
      <>
        <code className="font-mono text-[0.8125rem] text-foreground">grantReadWrite</code> is a
        decision. Thirty-one policy actions across four services is a transcription.
      </>
    ),
  },
  {
    title: 'Deterministic',
    body: 'Same program, same HCL — so an agent’s output is reviewable as a diff, and the constructs it calls are already covered by end-to-end tests.',
  },
]

function formatTokens(n: number) {
  return `${Math.round(n / 1000)}k`
}

/** Tweens a number toward its target so the counters visibly climb each turn. */
function useCountUp(target: number, duration = 600) {
  const [value, setValue] = useState(target)
  const from = useRef(target)

  useEffect(() => {
    const start = performance.now()
    const origin = from.current
    let frame = 0
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration)
      const next = origin + (target - origin) * (1 - Math.pow(1 - p, 3))
      from.current = next
      setValue(next)
      if (p < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, duration])

  return value
}

function LogRow({ row, className, hidden }: { row: Row; className?: string; hidden?: boolean }) {
  const style = KIND_STYLE[row.kind]
  return (
    <li
      aria-hidden={hidden}
      className={cn(
        'grid grid-cols-[4.25rem_minmax(0,1fr)] gap-3 border-l-2 py-2.5 pl-3 pr-4 sm:grid-cols-[5rem_minmax(0,1fr)] sm:pl-5',
        style.bar,
        className,
      )}
    >
      <span className={cn('pt-px font-mono text-xs', style.label)}>{row.label ?? row.kind}</span>
      <div className="min-w-0">
        <p
          className={cn(
            'text-pretty',
            style.text,
            style.mono
              ? 'whitespace-pre-wrap break-words font-mono text-[0.8125rem] leading-relaxed'
              : 'text-sm leading-relaxed',
          )}
        >
          {row.text}
        </p>
        {row.sub && <p className="mt-1 font-mono text-xs text-muted-foreground">{row.sub}</p>}
      </div>
    </li>
  )
}

function PanelHeader({
  title,
  tone,
  tokens,
  deploys,
}: {
  title: string
  tone: string
  tokens: number
  deploys: number
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b px-4 py-3 sm:px-5">
      <span className={cn('font-mono text-[0.8125rem]', tone)}>{title}</span>
      <span className="font-mono text-xs tabular-nums text-muted-foreground">
        {formatTokens(tokens)} tokens · {deploys} {deploys === 1 ? 'deploy' : 'deploys'}
      </span>
    </div>
  )
}

export function Agents() {
  const [tick, setTick] = useState(0)
  const [paused, setPaused] = useState(false)
  const [visible, setVisible] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const logRef = useRef<HTMLDivElement>(null)

  const total = TIMELINE.length
  // With reduced motion, show both finished runs and never animate.
  const step = reducedMotion ? total : tick
  const done = step >= total

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0.25,
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Only advance while the section is on screen, so a reader arriving late
  // still sees the runs from the start.
  useEffect(() => {
    if (reducedMotion || !visible || paused) return
    const id = window.setTimeout(
      () => setTick((s) => (s >= total ? 0 : s + 1)),
      done ? HOLD_MS : STEP_MS,
    )
    return () => window.clearTimeout(id)
  }, [step, visible, paused, reducedMotion, done, total])

  // Keep the newest raw-resource row in view without scrolling the page.
  useEffect(() => {
    const el = logRef.current
    if (!el) return
    el.scrollTo({ top: step === 0 ? 0 : el.scrollHeight, behavior: reducedMotion ? 'auto' : 'smooth' })
  }, [step, reducedMotion])

  const revealed = TIMELINE.slice(0, step)
  const currentTurn = revealed.length ? revealed[revealed.length - 1].turn : -1
  const rawDeploys = revealed.filter((r) => r.row.kind === 'apply').length
  const l2Shown = Math.min(step, L2.length)
  const l2Deploys = L2.slice(0, l2Shown).some((r) => r.kind === 'apply') ? 1 : 0

  const rawTokens = useCountUp(currentTurn >= 0 ? RAW[currentTurn].tokens : 0)
  const l2Tokens = useCountUp(l2Shown > 0 ? L2_TOKENS : 0)

  return (
    <section ref={sectionRef} id="agents" className="scroll-mt-16 border-b bg-card/30">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span className="label-mono text-destructive">Agent loop · running side by side</span>
            <h2 className="mt-4 text-balance text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
              The cheapest tokens are the ones you never spend.
            </h2>
            <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
              Same task — least-privilege IAM for a deploy role. Left: the agent discovers each
              missing action by failing a real end-to-end apply. Right: it picks an intent and the
              library owns the transcription.
            </p>
          </div>

          <div className="flex w-full shrink-0 flex-col gap-2 lg:w-80">
            <div className="flex items-center justify-between gap-3 lg:justify-end">
              <span className="whitespace-nowrap font-mono text-xs tabular-nums text-muted-foreground" aria-live="polite">
                {done
                  ? reducedMotion
                    ? 'both runs complete'
                    : 'both runs complete · restarting'
                  : `turn ${Math.max(currentTurn, 0) + 1} of ${RAW.length}`}
              </span>
              {!reducedMotion && (
                <button
                  type="button"
                  onClick={() => setPaused((p) => !p)}
                  aria-label={paused ? 'Resume animation' : 'Pause animation'}
                  className="rounded-md border p-1 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {paused ? <Play className="size-3" /> : <Pause className="size-3" />}
                </button>
              )}
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-brand transition-[width] duration-500 ease-out"
                style={{ width: `${(step / total) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="flex flex-col overflow-hidden rounded-xl border bg-destructive/[0.03]">
            <PanelHeader
              title="raw provider resources"
              tone="text-destructive"
              tokens={rawTokens}
              deploys={rawDeploys}
            />
            <div ref={logRef} className="h-[26rem] overflow-y-auto py-3 sm:h-[30rem]">
              <ol className="flex flex-col gap-1">
                {revealed.map(({ row }, i) => (
                  <LogRow
                    key={i}
                    row={row}
                    className="animate-in fade-in slide-in-from-bottom-1 duration-300"
                  />
                ))}
              </ol>
            </div>
          </div>

          <div className="flex flex-col overflow-hidden rounded-xl border border-brand/30 bg-brand-muted/30">
            <PanelHeader
              title="L2 constructs + grant methods"
              tone="text-brand"
              tokens={l2Tokens}
              deploys={l2Deploys}
            />
            {/* Every row is always rendered so the panel never changes height; on
                mobile, where the panels stack, that keeps the page from jumping. */}
            <ol className="flex flex-col gap-1 py-3 lg:h-[30rem]">
              {L2.map((row, i) => (
                <LogRow
                  key={i}
                  row={row}
                  hidden={i >= l2Shown}
                  className={cn(
                    'transition-all duration-300',
                    i < l2Shown ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0',
                  )}
                />
              ))}
            </ol>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {CARDS.map((card) => (
            <div key={card.title} className="rounded-xl border bg-background p-6">
              <h3 className="label-mono">{card.title}</h3>
              <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground">
                {card.body}
              </p>
            </div>
          ))}

          <div className="relative overflow-hidden rounded-xl border bg-background p-6">
            <div aria-hidden className="pointer-events-none select-none blur-[3px]">
              <span className="label-mono">Token benchmark</span>
              <div className="mt-4 h-2 w-2/3 rounded-full bg-brand/50" />
              <div className="mt-2 h-2 w-1/4 rounded-full bg-destructive/50" />
              <p className="mt-4 text-sm text-muted-foreground">
                tokens to converge, by module and approach
              </p>
            </div>
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <span className="rounded-md border bg-background px-3 py-2 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-foreground">
                Benchmark report — coming soon
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
