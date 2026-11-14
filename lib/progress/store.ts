'use client'

import { useSyncExternalStore } from 'react'
import { atLeast, type EndpointSlot, localEndpoint, endpointRefusal, type StepState } from './model'

/**
 * Client-side progress state shared by the workshop progress components. The
 * session is created on the first progress action, not on page view, so readers
 * and crawlers never take a capped seat; its token lives in localStorage and is
 * sent as a bearer token. With the Worker unreachable every call resolves quietly.
 */

/**
 * The Worker's address, only from NEXT_PUBLIC_WORKSHOP_API (.env.development,
 * .env.production). Unset means progress tracking is off.
 */
export const WORKSHOP_API = (process.env.NEXT_PUBLIC_WORKSHOP_API ?? '').replace(/\/+$/, '')

const STORAGE_KEY = 'tc-workshop-progress:v1'
const REQUEST_TIMEOUT_MS = 8000
/** The spinner shows for at least this long, so the suspense registers. */
export const MIN_VERIFY_MS = 550
/** The longest "next" waits for a verdict before moving on anyway. */
const VERIFY_CAP_MS = 7000

type Profile = { displayName: string; email: string | null }
type StepRecord = { state: StepState; reason?: string }

export type ProgressState = {
  /** idle: not loaded; ready: in sync (or no session yet); offline: Worker unreachable; unavailable: Worker refused a session (full). */
  status: 'idle' | 'loading' | 'ready' | 'offline' | 'unavailable'
  session: { token: string; sessionId: string } | null
  endpoints: Partial<Record<EndpointSlot, string>>
  steps: Record<string, StepRecord>
  profile: Profile | null
  inviteDismissed: boolean
  /** The step whose check is running right now. */
  verifying: string | null
  /** The last verdict, for the settle animation and the live region. */
  flash: { stepId: string; state: StepState; reason: string; at: number } | null
}

const INITIAL: ProgressState = {
  status: 'idle',
  session: null,
  endpoints: {},
  steps: {},
  profile: null,
  inviteDismissed: false,
  verifying: null,
  flash: null,
}

let state: ProgressState = INITIAL
let hydrated = false
const listeners = new Set<() => void>()

function set(patch: Partial<ProgressState>) {
  state = { ...state, ...patch }
  persist()
  for (const l of listeners) l()
}

function persist() {
  if (typeof window === 'undefined') return
  try {
    const { session, endpoints, steps, profile, inviteDismissed } = state
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ session, endpoints, steps, profile, inviteDismissed }))
  } catch {
    // storage full or disabled: progress still works for this page view
  }
}

function hydrate() {
  if (hydrated || typeof window === 'undefined') return
  hydrated = true
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (saved && typeof saved === 'object') {
      state = {
        ...state,
        session:
          saved.session && typeof saved.session.token === 'string' && typeof saved.session.sessionId === 'string'
            ? saved.session
            : null,
        endpoints: saved.endpoints && typeof saved.endpoints === 'object' ? saved.endpoints : {},
        steps: saved.steps && typeof saved.steps === 'object' ? saved.steps : {},
        profile: saved.profile ?? null,
        inviteDismissed: saved.inviteDismissed === true,
      }
    }
  } catch {
    // unreadable storage: start fresh
  }
}

function subscribe(listener: () => void) {
  hydrate()
  listeners.add(listener)
  return () => listeners.delete(listener)
}

const getSnapshot = () => state
const getServerSnapshot = () => INITIAL

/** For non-React readers (and the tests). */
export { subscribe as subscribeProgress, getSnapshot as getProgress }

export function useProgress(): ProgressState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

type ApiResult = { status: number; body: Record<string, unknown> } | null

/** null when the Worker cannot be reached (network, CORS, timeout). Never throws. */
async function api(path: string, init: RequestInit = {}, auth = true): Promise<ApiResult> {
  if (!WORKSHOP_API) return null
  const headers: Record<string, string> = {}
  if (init.body) headers['Content-Type'] = 'application/json'
  if (auth && state.session) headers.Authorization = `Bearer ${state.session.token}`
  try {
    const r = await fetch(WORKSHOP_API + path, {
      ...init,
      headers,
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-store',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
    const body = (await r.json().catch(() => ({}))) as Record<string, unknown>
    return { status: r.status, body }
  } catch {
    return null
  }
}

type SessionView = {
  sessionId: string
  profile: Profile | null
  endpoints: Partial<Record<EndpointSlot, string>>
  steps: Record<string, StepRecord>
}

function applyView(v: SessionView) {
  set({ status: 'ready', endpoints: v.endpoints ?? {}, steps: v.steps ?? {}, profile: v.profile ?? null })
}

function dropSession() {
  // The Worker no longer knows this token (new workshop id, or data was reset).
  set({ session: null, steps: {}, profile: null })
}

let loading: Promise<void> | null = null

/** Syncs with the Worker once per page load. Without a session there is nothing to fetch. */
export function ensureLoaded(): Promise<void> {
  hydrate()
  if (loading) return loading
  loading = (async () => {
    if (!state.session) {
      set({ status: 'ready' })
      return
    }
    set({ status: 'loading' })
    const r = await api('/api/session')
    if (r === null) return set({ status: 'offline' })
    if (r.status === 401) {
      dropSession()
      return set({ status: 'ready' })
    }
    if (r.status === 200) return applyView(r.body as unknown as SessionView)
    set({ status: 'offline' })
  })()
  return loading
}

let creating: Promise<boolean> | null = null

/** Creates the anonymous session on first use. False when the Worker is unreachable or full. */
async function ensureSession(): Promise<boolean> {
  await ensureLoaded()
  if (state.session) return true
  if (state.status === 'offline' || state.status === 'unavailable') return false
  creating ??= (async () => {
    const r = await api('/api/sessions', { method: 'POST' }, false)
    creating = null
    if (r === null) {
      set({ status: 'offline' })
      return false
    }
    if (r.status !== 201) {
      set({ status: 'unavailable' })
      return false
    }
    set({ status: 'ready', session: { token: String(r.body.token), sessionId: String(r.body.sessionId) } })
    return true
  })()
  return creating
}

/** Records `stepId` without holding the reader: "done" at once, or whatever the Worker's check says. */
async function record(stepId: string, verifies: boolean) {
  if (!(await ensureSession())) return
  if (!verifies && !state.steps[stepId]) set({ steps: { ...state.steps, [stepId]: { state: 'done', reason: 'no_check' } } })
  const r = await api('/api/session/advance', { method: 'POST', body: JSON.stringify({ step: stepId }) })
  if (r?.status === 200 && r.body.steps) set({ steps: r.body.steps as Record<string, StepRecord> })
}

let visiting: { stepId: string; verifies: boolean } | null = null
let advanced: string | null = null

/**
 * The reader is now on `stepId`. A page left by the sidebar, "Previous" or the browser's history
 * (anything but "Next", which records it itself) is recorded here, quietly, if it has no state yet.
 */
export function visit(stepId: string, verifies: boolean) {
  hydrate()
  const left = visiting
  visiting = { stepId, verifies }
  if (!left || left.stepId === stepId) return
  const viaNext = advanced === left.stepId
  advanced = null
  if (viaNext || state.steps[left.stepId]) return
  void record(left.stepId, left.verifies)
}

export type AdvanceResult = { state: StepState; reason: string } | null

/**
 * The attendee moves on from `stepId`. The Worker verifies pages with a check
 * (the browser sends only the step id); others become "done" at once. Resolves
 * null when progress is unavailable, so the caller just navigates.
 */
export async function advance(stepId: string, verifies: boolean): Promise<AdvanceResult> {
  advanced = stepId
  if (!verifies) {
    // Nothing to wait for: record in the background and let the reader move on at once.
    void record(stepId, false)
    return null
  }
  if (state.status === 'offline' || state.status === 'unavailable') return null

  set({ verifying: stepId, flash: null })
  // The verdict and the new step states are applied together, after the minimum spinner time,
  // so the segment never turns green while "Verifying" is still on screen.
  type Verdict = { state: StepState; reason: string; steps?: Record<string, StepRecord> }
  const work = (async (): Promise<Verdict | null> => {
    if (!(await ensureSession())) return null
    const r = await api('/api/session/advance', { method: 'POST', body: JSON.stringify({ step: stepId }) })
    if (r === null) {
      set({ status: 'offline' })
      return null
    }
    if (r.status === 401) {
      dropSession()
      return null
    }
    if (r.status !== 200) return null
    return {
      state: r.body.state as StepState,
      reason: String(r.body.reason ?? ''),
      steps: r.body.steps ? (r.body.steps as Record<string, StepRecord>) : undefined,
    }
  })()
  // Never hold the reader for long: past VERIFY_CAP_MS they move on, and a late verdict only
  // updates the segments quietly.
  let timer: ReturnType<typeof setTimeout> | undefined
  let late = false
  const cap = new Promise<null>((r) => {
    timer = setTimeout(() => {
      late = true
      r(null)
    }, VERIFY_CAP_MS)
  })
  const verdict = await atLeast(Promise.race([work, cap]), MIN_VERIFY_MS)
  clearTimeout(timer)
  if (late) void work.then((v) => v?.steps && set({ steps: v.steps }))
  const result: AdvanceResult = verdict ? { state: verdict.state, reason: verdict.reason } : null
  set({
    verifying: null,
    ...(verdict?.steps ? { steps: verdict.steps } : {}),
    flash: result ? { stepId, ...result, at: Date.now() } : null,
  })
  return result
}

export type SaveResult = { ok: true; url: string; synced: boolean } | { ok: false; message: string }

/** Saves the attendee's endpoint in their session (and in this browser, for the code placeholders). */
export async function saveEndpoint(slot: EndpointSlot, input: string): Promise<SaveResult> {
  const ready = await ensureSession()
  if (ready) {
    const r = await api(`/api/session/endpoints/${slot}`, { method: 'PUT', body: JSON.stringify({ url: input.trim() }) })
    if (r?.status === 200) {
      const url = String(r.body.url)
      set({ endpoints: { ...state.endpoints, [slot]: url } })
      return { ok: true, url, synced: true }
    }
    if (r && r.status !== 401) return { ok: false, message: endpointRefusal(String(r.body.reason ?? '')) }
  }
  // Worker unreachable: keep a real-looking endpoint in this browser so the code blocks still use it.
  const url = localEndpoint(input)
  if (!url) return { ok: false, message: endpointRefusal('host') }
  set({ endpoints: { ...state.endpoints, [slot]: url } })
  return { ok: true, url, synced: false }
}

export type BoardResult = { ok: true } | { ok: false; message: string; field?: string }

export async function joinBoard(displayName: string, email: string): Promise<BoardResult> {
  if (!(await ensureSession())) return { ok: false, message: 'The board is not reachable right now. Your progress still counts.' }
  const r = await api('/api/session/board', { method: 'PUT', body: JSON.stringify({ displayName, email }) })
  if (r?.status === 200) {
    applyView(r.body as unknown as SessionView)
    return { ok: true }
  }
  if (r === null) return { ok: false, message: 'The board is not reachable right now. Your progress still counts.' }
  if (r.status === 429) return { ok: false, message: 'Easy there: give it a minute, then try again.' }
  return { ok: false, message: String(r.body.error ?? 'That did not work.'), field: r.body.field ? String(r.body.field) : undefined }
}

export async function leaveBoard(): Promise<void> {
  const r = await api('/api/session/board', { method: 'DELETE' })
  if (r?.status === 200) applyView(r.body as unknown as SessionView)
}

export function dismissInvite() {
  set({ inviteDismissed: true })
}
