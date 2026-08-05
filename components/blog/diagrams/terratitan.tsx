/**
 * Diagrams for the TerraTitan migration post.
 *
 * Hand-drawn SVG rather than a graph library. There are three fixed pictures
 * here; a runtime layout engine would ship ~400KB to draw them, and the
 * previous site already proved how that ends (a lazy-loaded @xyflow chunk that
 * no post ever rendered). Everything below is inert markup with real <text>,
 * coloured from the page's own CSS variables so light and dark come free.
 *
 * The pipelines are laid out VERTICALLY on purpose: a tall narrow column
 * survives a 360px viewport, where a wide flowchart would scale into
 * illegibility. <DiagramFigure> supplies zoom for the detail.
 */

const MONO = 'var(--font-mono)'

type Tone = 'default' | 'brand' | 'doc' | 'warn' | 'stop'

const TONE: Record<Tone, { fill: string; stroke: string; text: string }> = {
  default: { fill: 'var(--card)', stroke: 'var(--border)', text: 'var(--foreground)' },
  brand: { fill: 'var(--brand-muted)', stroke: 'var(--brand)', text: 'var(--foreground)' },
  doc: { fill: 'var(--doc-muted)', stroke: 'var(--doc)', text: 'var(--foreground)' },
  warn: { fill: 'var(--warning-muted)', stroke: 'var(--warning)', text: 'var(--foreground)' },
  stop: { fill: 'transparent', stroke: 'var(--destructive)', text: 'var(--destructive)' },
}

function Node({
  x,
  y,
  w,
  h = 48,
  label,
  sub,
  tone = 'default',
  dashed,
  badge,
}: {
  x: number
  y: number
  w: number
  h?: number
  label: string
  sub?: string
  tone?: Tone
  dashed?: boolean
  badge?: string
}) {
  const t = TONE[tone]
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={8}
        fill={t.fill}
        stroke={t.stroke}
        strokeWidth={1.25}
        strokeDasharray={dashed ? '5 4' : undefined}
      />
      {/* A badge occupies the top-right corner, so the label centres on what is
          left of the box rather than colliding with it. */}
      <text
        x={x + (badge ? (w - 50) / 2 : w / 2)}
        y={sub ? y + h / 2 - 4 : y + h / 2 + 4}
        textAnchor="middle"
        fill={t.text}
        fontSize={13}
        fontWeight={500}
      >
        {label}
      </text>
      {sub ? (
        <text
          x={x + (badge ? (w - 50) / 2 : w / 2)}
          y={y + h / 2 + 14}
          textAnchor="middle"
          fill="var(--muted-foreground)"
          fontSize={10}
          fontFamily={MONO}
        >
          {sub}
        </text>
      ) : null}
      {badge ? (
        <g>
          <rect
            x={x + w - 46}
            y={y + 7}
            width={38}
            height={15}
            rx={7.5}
            fill="var(--brand-muted)"
            stroke="var(--brand)"
            strokeWidth={0.75}
          />
          <text
            x={x + w - 27}
            y={y + 18}
            textAnchor="middle"
            fill="var(--brand)"
            fontSize={9}
            fontFamily={MONO}
          >
            {badge}
          </text>
        </g>
      ) : null}
    </g>
  )
}

/** Arrowheads are drawn inline; <defs> markers would collide when the same
 *  diagram is rendered twice (inline + inside the zoom dialog). */
function Head({
  x,
  y,
  dir = 'down',
  color = 'var(--border)',
}: {
  x: number
  y: number
  dir?: 'down' | 'up' | 'left' | 'right'
  color?: string
}) {
  // (x, y) is always the tip; the base trails behind it.
  const d = {
    down: `M${x - 4},${y - 6} L${x + 4},${y - 6} L${x},${y} Z`,
    up: `M${x - 4},${y + 6} L${x + 4},${y + 6} L${x},${y} Z`,
    left: `M${x + 6},${y - 4} L${x + 6},${y + 4} L${x},${y} Z`,
    right: `M${x - 6},${y - 4} L${x - 6},${y + 4} L${x},${y} Z`,
  }[dir]
  return <path d={d} fill={color} />
}

/** Straight vertical connector between two stacked nodes. */
function Down({ x, y1, y2, color = 'var(--border)' }: { x: number; y1: number; y2: number; color?: string }) {
  return (
    <g>
      <line x1={x} y1={y1} x2={x} y2={y2} stroke={color} strokeWidth={1.25} />
      <Head x={x} y={y2} color={color} />
    </g>
  )
}

/** Curved connector, used for fan-out and fan-in. */
function Curve({ d, color = 'var(--border)', dashed }: { d: string; color?: string; dashed?: boolean }) {
  return (
    <path d={d} fill="none" stroke={color} strokeWidth={1.25} strokeDasharray={dashed ? '5 4' : undefined} />
  )
}

/** Retry loop: exits a node's right edge, runs up the gutter, re-enters on top. */
function Loop({
  yFrom,
  yTo,
  xRight,
  gutter,
  label,
}: {
  yFrom: number
  yTo: number
  xRight: number
  gutter: number
  label: string
}) {
  const c = 'var(--warning)'
  return (
    <g>
      <path
        d={`M${xRight},${yFrom} H${gutter - 8} Q${gutter},${yFrom} ${gutter},${yFrom - 8} V${yTo + 8} Q${gutter},${yTo} ${gutter - 8},${yTo} H${xRight + 8}`}
        fill="none"
        stroke={c}
        strokeWidth={1.25}
        strokeDasharray="5 4"
      />
      <Head x={xRight} y={yTo} dir="left" color={c} />
      <text x={gutter + 6} y={(yFrom + yTo) / 2} fill={c} fontSize={9.5} fontFamily={MONO}>
        {label}
      </text>
    </g>
  )
}

function Caption({ x, y, children }: { x: number; y: number; children: string }) {
  return (
    <text x={x} y={y} fill="var(--muted-foreground)" fontSize={10} fontFamily={MONO}>
      {children}
    </text>
  )
}

/* ------------------------------------------------------------------ */

/** The Mastra pipeline: two blocking human gates, a vector index in the
 *  middle, and nothing downstream of generation. */
export function MastraPipeline() {
  return (
    <svg viewBox="0 0 470 892" role="img" aria-labelledby="mastra-t" fontFamily="var(--font-sans)">
      <title id="mastra-t">
        The Mastra conversion workflow: workspace setup, static scan, a human file-selection gate,
        RAG retrieval against an Upstash vector index, a second human mapping-review gate, context
        export, Gemini generation of source and tests, and a write step with no verification after it.
      </title>

      <Node x={24} y={16} w={196} label="ensure-upstream" sub="aws-cdk @ pinned tag" />
      <Node x={240} y={16} w={196} label="ensure-workspace" sub="clone terraconstructs/base" />

      <Curve d="M122,64 C122,88 230,80 230,100" />
      <Curve d="M338,64 C338,88 230,80 230,100" />
      <Head x={230} y={106} />

      <Node x={110} y={106} w={240} label="find-input-refs" sub="static scan → CfnXxx" />
      <Down x={230} y1={154} y2={196} />

      <Node
        x={86}
        y={196}
        w={288}
        h={58}
        label="filter-input-files"
        sub="suspend · human deselects files"
        tone="warn"
        dashed
      />
      <Caption x={86} y={190}>
        human in the loop #1
      </Caption>
      <Down x={230} y1={254} y2={296} />

      <Node x={110} y={296} w={240} label="find-lib-output-refs" sub="one vector query per L1 class" />
      <Down x={230} y1={344} y2={378} />

      <rect
        x={56}
        y={378}
        width={348}
        height={96}
        rx={10}
        fill="var(--doc-muted)"
        stroke="var(--doc)"
        strokeWidth={1.25}
        strokeDasharray="5 4"
      />
      <text x={70} y={398} fill="var(--doc)" fontSize={10} fontFamily={MONO}>
        RAG
      </text>
      <text x={230} y={418} textAnchor="middle" fill="var(--foreground)" fontSize={11} fontFamily={MONO}>
        Upstash index · 1,526 resources
      </text>
      <text x={230} y={437} textAnchor="middle" fill="var(--muted-foreground)" fontSize={10.5} fontFamily={MONO}>
        text-embedding-3-small · topK 10
      </text>
      <text x={230} y={456} textAnchor="middle" fill="var(--muted-foreground)" fontSize={10.5} fontFamily={MONO}>
        gpt-4o-mini rerank · topK 5
      </text>
      <Down x={230} y1={474} y2={508} />

      <Node
        x={86}
        y={508}
        w={288}
        h={58}
        label="review-cdktf-refs"
        sub="suspend when score ≤ 0.7 · pick 2–5"
        tone="warn"
        dashed
      />
      <Caption x={86} y={502}>
        human in the loop #2
      </Caption>
      <Down x={230} y1={566} y2={600} />

      <Node x={110} y={600} w={240} label="export-conversion-context" sub="prompts + mappings to disk" />

      <Curve d="M230,648 C230,668 122,666 122,680" />
      <Curve d="M230,648 C230,668 338,666 338,680" />
      <Head x={122} y={686} />
      <Head x={338} y={686} />

      <Node x={24} y={686} w={196} label="convert-source" sub="gemini-2.5-pro · 2-shot" />
      <Node x={240} y={686} w={196} label="convert-test" sub="gemini-2.5-pro · 2-shot" />

      <Curve d="M122,734 C122,756 230,752 230,768" />
      <Curve d="M338,734 C338,756 230,752 230,768" />
      <Head x={230} y={774} />

      <Node x={110} y={774} w={240} h={44} label="write-to-workspace" />
      <Down x={230} y1={818} y2={840} color="var(--destructive)" />

      <Node
        x={56}
        y={840}
        w={348}
        h={44}
        label="no compile gate · no test gate · no fix loop"
        tone="stop"
        dashed
      />
    </svg>
  )
}

/* ------------------------------------------------------------------ */

/** A small, deliberately concrete explainer for the AST scanner section. */
export function CfnScanExplainer() {
  return (
    <svg viewBox="0 0 470 410" role="img" aria-labelledby="scan-t" fontFamily="var(--font-sans)">
      <title id="scan-t">
        cfn-scan reads TypeScript files, finds which files import other files, and groups them into
        conversion waves. A task definition comes before a service that imports it; unrelated files
        in the same wave can be converted at the same time.
      </title>

      <Caption x={24} y={24}>
        upstream TypeScript files
      </Caption>
      <Node x={24} y={36} w={196} label="task-definition.ts" sub="uses CfnTaskDefinition" tone="doc" />
      <Node x={250} y={36} w={196} label="logging.ts" sub="uses helper code" tone="doc" />

      <Caption x={24} y={120}>
        import relationship found by the scanner
      </Caption>
      <Node x={137} y={132} w={196} label="service.ts" sub="imports task-definition.ts" tone="doc" />
      {/* Points importer → imported, matching the label. Conversion order is
          the reverse, and the waves below are what say so. */}
      <Curve d="M194,132 C194,110 220,112 220,90" color="var(--doc)" />
      <Head x={220} y={84} dir="up" color="var(--doc)" />

      <Caption x={24} y={218}>
        conversion waves
      </Caption>
      <Node x={24} y={230} w={196} label="Wave 1" sub="task definition + logging" tone="brand" />
      <Node x={250} y={230} w={196} label="Wave 2" sub="after its import exists" tone="brand" />
      <Curve d="M220,254 H244" color="var(--brand)" />
      <Head x={250} y={254} dir="right" color="var(--brand)" />

      <Caption x={24} y={316}>
        classification guides the work
      </Caption>
      <text x={24} y={338} fill="var(--foreground)" fontSize={11} fontFamily={MONO}>
        L1_BACKED → map and convert
      </text>
      <text x={24} y={360} fill="var(--foreground)" fontSize={11} fontFamily={MONO}>
        PURE_L2 → copy with small import/header edits
      </text>
      <text x={24} y={382} fill="var(--foreground)" fontSize={11} fontFamily={MONO}>
        BARREL → wire exports after destination paths exist
      </text>
    </svg>
  )
}

/* ------------------------------------------------------------------ */

/** The Claude-native workflow: deterministic inputs, pinned models, bounded
 *  retry loops, and an independent verifier before anything reaches a human. */
export function ClaudeNativePipeline() {
  return (
    <svg viewBox="0 0 470 892" role="img" aria-labelledby="native-t" fontFamily="var(--font-sans)">
      <title id="native-t">
        The Claude Code dynamic workflow: live type definitions and an AST scanner feed an opus
        planner, a two-stage mapping pipeline, batched sonnet converters, bounded compile, test and
        integration loops, an independent opus verifier, and a review step that ends in a pull request.
      </title>

      <rect
        x={24}
        y={16}
        width={412}
        height={66}
        rx={10}
        fill="var(--doc-muted)"
        stroke="var(--doc)"
        strokeWidth={1.25}
        strokeDasharray="5 4"
      />
      <text x={38} y={36} fill="var(--doc)" fontSize={10} fontFamily={MONO}>
        ground truth, read live
      </text>
      <text x={230} y={55} textAnchor="middle" fill="var(--foreground)" fontSize={10.5} fontFamily={MONO}>
        worktree node_modules/@cdktn/provider-aws
      </text>
      <text x={230} y={72} textAnchor="middle" fill="var(--muted-foreground)" fontSize={10.5} fontFamily={MONO}>
        tools/cfn-scan.mjs — inventory + waves
      </text>
      <Down x={230} y1={82} y2={110} color="var(--doc)" />

      <Node
        x={110}
        y={110}
        w={240}
        label="Plan"
        sub="waves · copyMode · loc"
        badge="opus"
        tone="brand"
      />
      <Down x={230} y1={158} y2={192} />

      <Node x={24} y={192} w={186} label="Map — find" sub="candidate resources" badge="sonnet" />
      <Node x={250} y={192} w={186} label="Map — verify" sub="adversarial" badge="opus" />
      <g>
        <line x1={210} y1={216} x2={244} y2={216} stroke="var(--border)" strokeWidth={1.25} />
        <path d="M250,216 L244,212 L244,220 Z" fill="var(--border)" />
      </g>
      <Down x={230} y1={240} y2={274} />

      <Node
        x={86}
        y={274}
        w={288}
        h={58}
        label="Convert — waves"
        sub="batched to ≤700 upstream LOC"
        badge="sonnet"
      />
      <Down x={230} y1={332} y2={366} />

      <Node x={110} y={366} w={240} h={44} label="Compile" sub="tsc → fix" badge="sonnet" />
      <Loop yFrom={402} yTo={374} xRight={350} gutter={404} label="≤6" />
      <Down x={230} y1={410} y2={442} />

      <Node x={110} y={442} w={240} h={44} label="Test" sub="jest → fix" badge="sonnet" />
      <Loop yFrom={478} yTo={450} xRight={350} gutter={404} label="≤6" />
      <Down x={230} y1={486} y2={518} />

      <Node
        x={110}
        y={518}
        w={240}
        h={52}
        label="Integ"
        sub="synth · go vet · tofu validate"
        badge="sonnet"
      />
      <Loop yFrom={562} yTo={526} xRight={350} gutter={404} label="≤3" />
      <Down x={230} y1={570} y2={604} />

      <Node
        x={86}
        y={604}
        w={288}
        h={58}
        label="Verify — independent"
        sub="violations block · advisories don't"
        badge="opus"
        tone="brand"
      />
      <Loop yFrom={654} yTo={612} xRight={374} gutter={404} label="≤3" />
      <Down x={230} y1={662} y2={696} />

      <Node
        x={110}
        y={696}
        w={240}
        h={48}
        label="Review"
        sub="report file first"
        badge="opus"
        tone="brand"
      />
      <Down x={230} y1={744} y2={778} />

      <Node
        x={86}
        y={778}
        w={288}
        h={52}
        label="Pull request"
        sub="committed plan · mappings · report"
        tone="doc"
      />
      <Caption x={86} y={852}>
        human review is asynchronous, on artifacts —
      </Caption>
      <Caption x={86} y={868}>
        never a blocking prompt mid-run
      </Caption>
    </svg>
  )
}

/* ------------------------------------------------------------------ */

const RUN4: number[][] = [[1], [1], [1, 1], [1, 1, 1, 1], [1, 1, 1], [1]]
const RUN5: number[][] = [[1], [2], [1], [7], [1]]

/** One agent = one pill; the squares inside it are the files it converted. */
function Wave({
  x,
  y,
  agents,
  highlight,
}: {
  x: number
  y: number
  agents: number[]
  highlight?: boolean
}) {
  // Lay the row out first: the pills are variable-width, so each one's x
  // depends on every pill before it. Doing this up front keeps the JSX below a
  // pure mapping over already-final coordinates.
  const pills: { files: number; x: number; w: number }[] = []
  let cursor = x
  for (const files of agents) {
    const w = 14 + files * 13
    pills.push({ files, x: cursor, w })
    cursor += w + 8
  }

  return (
    <g>
      {pills.map((pill, i) => (
        <g key={i}>
          <rect
            x={pill.x}
            y={y}
            width={pill.w}
            height={26}
            rx={13}
            fill={highlight ? 'var(--brand-muted)' : 'var(--card)'}
            stroke={highlight ? 'var(--brand)' : 'var(--border)'}
            strokeWidth={1.25}
          />
          {Array.from({ length: pill.files }).map((_, f) => (
            <rect
              key={f}
              x={pill.x + 8 + f * 13}
              y={y + 9}
              width={8}
              height={8}
              rx={2}
              fill={highlight ? 'var(--brand)' : 'var(--muted-foreground)'}
            />
          ))}
        </g>
      ))}
    </g>
  )
}

/** Run 4 vs run 5 converter fan-out on the identical module. */
export function GranularityAB() {
  return (
    <svg viewBox="0 0 720 392" role="img" aria-labelledby="ab-t" fontFamily="var(--font-sans)">
      <title id="ab-t">
        Converter fan-out compared. Run 4 spawned one agent per file: twelve agents across six waves.
        Run 5 batched files to a 700-line budget: five agents across five waves, with wave four
        converting seven files in a single agent.
      </title>

      <text x={30} y={30} fill="var(--foreground)" fontSize={13} fontWeight={500}>
        Run 4 — one agent per file
      </text>
      <text x={30} y={48} fill="var(--muted-foreground)" fontSize={10.5} fontFamily={MONO}>
        12 converter agents · 6 waves
      </text>

      <text x={396} y={30} fill="var(--foreground)" fontSize={13} fontWeight={500}>
        Run 5 — one agent per 700 LOC
      </text>
      <text x={396} y={48} fill="var(--muted-foreground)" fontSize={10.5} fontFamily={MONO}>
        5 converter agents · 5 waves
      </text>

      <line x1={366} y1={16} x2={366} y2={340} stroke="var(--hairline)" strokeWidth={1} />

      {RUN4.map((agents, i) => (
        <g key={i}>
          <text x={30} y={94 + i * 40} fill="var(--muted-foreground)" fontSize={10} fontFamily={MONO}>
            w{i + 1}
          </text>
          <Wave x={56} y={78 + i * 40} agents={agents} />
        </g>
      ))}

      {RUN5.map((agents, i) => (
        <g key={i}>
          <text x={396} y={94 + i * 40} fill="var(--muted-foreground)" fontSize={10} fontFamily={MONO}>
            w{i + 1}
          </text>
          <Wave x={422} y={78 + i * 40} agents={agents} highlight={i === 3} />
        </g>
      ))}

      {/* Sits to the right of wave four's pill, which ends at x=527. */}
      <text x={539} y={215} fill="var(--brand)" fontSize={10.5} fontFamily={MONO}>
        7 files · 697 of 700 LOC
      </text>

      <line x1={30} y1={356} x2={690} y2={356} stroke="var(--hairline)" strokeWidth={1} />
      <text x={30} y={378} fill="var(--muted-foreground)" fontSize={11} fontFamily={MONO}>
        same module · same tag · same inputs — only the script changed
      </text>
      <text x={690} y={378} textAnchor="end" fill="var(--brand)" fontSize={11} fontFamily={MONO}>
        −21% tokens · −25% wall clock
      </text>
    </svg>
  )
}
