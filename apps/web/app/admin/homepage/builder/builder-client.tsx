"use client"

import { useReducer, useState, useCallback, useRef } from "react"
import {
  GripVertical, Eye, EyeOff, RotateCcw, RotateCw, Save,
  CheckCircle2, AlertCircle, X, Zap, ChevronLeft, LayoutGrid,
  Maximize2, Minimize2,
} from "lucide-react"
import type { LayoutConfig, LayoutRow, SectionBlock, SectionId, ColSpan, SectionSize } from "@/lib/supabase/layout-config"
import { saveLayoutConfigAction } from "./actions"

// ── Section definitions ───────────────────────────────────────────

type SectionDef = {
  label: string
  group: "news" | "ads" | "content" | "utility"
  color: string
  icon: string
  description: string
  variants?: { value: string; label: string }[]
}

const DEFS: Record<SectionId, SectionDef> = {
  ticker:          { label: "Breaking Ticker",    group: "news",    color: "#475569", icon: "📰", description: "Scrolling breaking news bar" },
  top_ad:          { label: "Top Banner Ad",      group: "ads",     color: "#d97706", icon: "📢", description: "Full-width leaderboard ad" },
  hero:            { label: "Hero Story",          group: "news",    color: "#2563eb", icon: "🗞",  description: "Featured article (photo or text-split)", variants: [{ value: "photo", label: "Photo Overlay" }, { value: "text-split", label: "Text + Image" }] },
  mini_grid:       { label: "Mini Story Grid",     group: "news",    color: "#3b82f6", icon: "⊞",  description: "2×2 compact article cards" },
  latest_panel:    { label: "Latest News Panel",   group: "news",    color: "#0ea5e9", icon: "⚡",  description: "Scrollable latest articles" },
  trending:        { label: "Trending Section",    group: "news",    color: "#f97316", icon: "🔥", description: "Horizontal trending scroll" },
  text_stories:    { label: "Text Headlines",      group: "news",    color: "#64748b", icon: "☰",  description: "No-image compact headline list" },
  jobs_panel:      { label: "Job Openings",        group: "content", color: "#059669", icon: "💼", description: "Latest job listings panel" },
  section_links:   { label: "Section Quick-Links", group: "utility", color: "#334155", icon: "🔗", description: "News/Jobs/Shops/Elections nav bar" },
  mid_ad:          { label: "Mid-Page Ad",         group: "ads",     color: "#b45309", icon: "📢", description: "Ad between news and YouTube" },
  youtube:         { label: "YouTube Videos",      group: "content", color: "#dc2626", icon: "▶",  description: "Embedded YouTube video section" },
  local_updates:   { label: "Local Updates",       group: "news",    color: "#0d9488", icon: "📍", description: "Compact local news grid" },
  elections:       { label: "Elections Widget",    group: "content", color: "#7c3aed", icon: "🗳",  description: "Active election teaser" },
  property_panel:  { label: "Property Listings",   group: "content", color: "#ea580c", icon: "🏢", description: "Property teaser in sidebar" },
  shops_strip:     { label: "Featured Shops",      group: "content", color: "#047857", icon: "🏪", description: "4-shop directory strip" },
  bottom_ad:       { label: "Bottom Strip Ad",     group: "ads",     color: "#92400e", icon: "📢", description: "Narrow ad strip at bottom" },
  community_strip: { label: "Community CTA",       group: "utility", color: "#be123c", icon: "🤝", description: "Submit news/jobs/shops banner" },
}

const SPAN_OPTS: { value: ColSpan; label: string; desc: string }[] = [
  { value: 3,  label: "¼",    desc: "3/12 — Narrow sidebar" },
  { value: 4,  label: "⅓",    desc: "4/12 — One third" },
  { value: 6,  label: "½",    desc: "6/12 — Half width" },
  { value: 8,  label: "⅔",    desc: "8/12 — Two thirds" },
  { value: 9,  label: "¾",    desc: "9/12 — Three quarters" },
  { value: 12, label: "Full", desc: "12/12 — Full width" },
]

// ── State management ──────────────────────────────────────────────

type Selection = { rowId: string; sectionId: SectionId } | null

type State = {
  config: LayoutConfig
  selected: Selection
  past: LayoutConfig[]
  future: LayoutConfig[]
  dirty: boolean
}

type Action =
  | { type: "REORDER"; rows: LayoutRow[] }
  | { type: "TOGGLE_ROW"; rowId: string }
  | { type: "TOGGLE_SECTION"; rowId: string; sectionId: SectionId }
  | { type: "SET_SPAN"; rowId: string; sectionId: SectionId; colSpan: ColSpan }
  | { type: "SET_SIZE"; rowId: string; sectionId: SectionId; size: SectionSize }
  | { type: "SET_VARIANT"; rowId: string; sectionId: SectionId; variant: string }
  | { type: "SELECT"; sel: Selection }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "MARK_SAVED" }

function patchSection(
  config: LayoutConfig,
  rowId: string,
  sectionId: SectionId,
  fn: (s: SectionBlock) => SectionBlock,
): LayoutConfig {
  return {
    ...config,
    rows: config.rows.map((r) =>
      r.id !== rowId
        ? r
        : { ...r, sections: r.sections.map((s) => (s.id === sectionId ? fn(s) : s)) }
    ),
  }
}

function push(past: LayoutConfig[], c: LayoutConfig) {
  return [...past.slice(-25), c]
}

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "REORDER":
      return { ...s, config: { ...s.config, rows: a.rows }, past: push(s.past, s.config), future: [], dirty: true }
    case "TOGGLE_ROW":
      return {
        ...s,
        config: { ...s.config, rows: s.config.rows.map((r) => r.id === a.rowId ? { ...r, enabled: !r.enabled } : r) },
        past: push(s.past, s.config), future: [], dirty: true,
      }
    case "TOGGLE_SECTION":
      return { ...s, config: patchSection(s.config, a.rowId, a.sectionId, (x) => ({ ...x, enabled: !x.enabled })), past: push(s.past, s.config), future: [], dirty: true }
    case "SET_SPAN":
      return { ...s, config: patchSection(s.config, a.rowId, a.sectionId, (x) => ({ ...x, colSpan: a.colSpan })), past: push(s.past, s.config), future: [], dirty: true }
    case "SET_SIZE":
      return { ...s, config: patchSection(s.config, a.rowId, a.sectionId, (x) => ({ ...x, size: a.size })), past: push(s.past, s.config), future: [], dirty: true }
    case "SET_VARIANT":
      return { ...s, config: patchSection(s.config, a.rowId, a.sectionId, (x) => ({ ...x, variant: a.variant })), past: push(s.past, s.config), future: [], dirty: true }
    case "SELECT":
      return { ...s, selected: a.sel }
    case "UNDO": {
      if (!s.past.length) return s
      const prev = s.past[s.past.length - 1]
      return { ...s, config: prev, past: s.past.slice(0, -1), future: [s.config, ...s.future], dirty: true }
    }
    case "REDO": {
      if (!s.future.length) return s
      const nxt = s.future[0]
      return { ...s, config: nxt, past: push(s.past, s.config), future: s.future.slice(1), dirty: true }
    }
    case "MARK_SAVED":
      return { ...s, dirty: false }
    default:
      return s
  }
}

// ── Mini preview ──────────────────────────────────────────────────

function MiniPreview({ config, selected }: { config: LayoutConfig; selected: Selection }) {
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-700 bg-zinc-950">
      <div className="border-b border-zinc-700 px-3 py-1.5">
        <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Layout Schematic</p>
      </div>
      <div className="space-y-[3px] p-2">
        {config.rows.map((row) => {
          const vis = row.enabled ? row.sections.filter((s) => s.enabled) : []
          return (
            <div key={row.id} className="flex gap-[2px]">
              {!row.enabled ? (
                <div className="h-[10px] w-full rounded-[2px] bg-zinc-800 opacity-25" />
              ) : vis.length === 0 ? (
                <div className="h-[10px] w-full rounded-[2px] bg-zinc-800 opacity-20" />
              ) : (
                vis.map((b) => {
                  const def = DEFS[b.id]
                  const pct = (b.colSpan / 12) * 100
                  const isSel = selected?.rowId === row.id && selected?.sectionId === b.id
                  return (
                    <div
                      key={b.id}
                      style={{ width: `${pct}%`, backgroundColor: def.color }}
                      className={`h-[10px] rounded-[2px] transition ${isSel ? "brightness-150 ring-1 ring-white/50" : "opacity-75"}`}
                      title={def.label}
                    />
                  )
                })
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Section cell (canvas block) ───────────────────────────────────

function SectionCell({
  block, rowId, selected, dispatch,
}: {
  block: SectionBlock
  rowId: string
  selected: boolean
  dispatch: React.Dispatch<Action>
}) {
  const def = DEFS[block.id]
  const pct = (block.colSpan / 12) * 100

  return (
    <button
      type="button"
      onClick={() => dispatch({ type: "SELECT", sel: selected ? null : { rowId, sectionId: block.id } })}
      title={`${def.label} · ${block.colSpan}/12 cols`}
      style={{
        width: `${pct}%`,
        backgroundColor: block.enabled ? def.color + "dd" : "#27272a",
        borderWidth: selected ? 2 : 0,
        borderColor: selected ? "#93c5fd" : "transparent",
      }}
      className={`
        relative flex h-11 min-w-0 items-center overflow-hidden rounded px-2 text-left transition-all
        ${block.enabled ? "text-white" : "text-zinc-500"}
        ${selected ? "shadow-[0_0_0_2px_#3b82f6]" : "hover:brightness-125"}
      `}
    >
      <span className="mr-1 shrink-0 text-xs">{def.icon}</span>
      <span className="min-w-0 truncate text-[10px] font-bold leading-tight tracking-wide">
        {def.label}
      </span>
      {!block.enabled && (
        <span className="ml-auto shrink-0 text-[9px] opacity-50">OFF</span>
      )}
      {selected && (
        <span className="ml-auto shrink-0 rounded bg-white/20 px-1 text-[8px] font-bold">
          {block.colSpan}/12
        </span>
      )}
    </button>
  )
}

// ── Row item ──────────────────────────────────────────────────────

function RowItem({
  row, selected, isDragOver, dispatch, onDragStart, onDragOver, onDrop,
}: {
  row: LayoutRow
  selected: Selection
  isDragOver: boolean
  dispatch: React.Dispatch<Action>
  onDragStart: (id: string) => void
  onDragOver: (e: React.DragEvent, id: string) => void
  onDrop: (id: string) => void
}) {
  const hasSelectedSection = selected?.rowId === row.id

  return (
    <div
      draggable
      onDragStart={() => onDragStart(row.id)}
      onDragOver={(e) => onDragOver(e, row.id)}
      onDrop={(e) => { e.preventDefault(); onDrop(row.id) }}
      className={`
        group flex items-center gap-2 rounded-lg border p-2 transition-all cursor-grab active:cursor-grabbing
        ${row.enabled ? "border-zinc-700 bg-zinc-800/80" : "border-zinc-700/40 bg-zinc-800/30 opacity-50"}
        ${isDragOver ? "border-blue-500 bg-blue-900/20 shadow-lg shadow-blue-900/30" : ""}
        ${hasSelectedSection ? "border-zinc-600" : "hover:border-zinc-600"}
      `}
    >
      {/* Drag grip */}
      <div className="shrink-0 text-zinc-600 group-hover:text-zinc-400 transition" title="Drag to reorder">
        <GripVertical size={14} />
      </div>

      {/* Section blocks */}
      <div className="flex min-w-0 flex-1 gap-1">
        {row.sections.map((block) => (
          <SectionCell
            key={block.id}
            block={block}
            rowId={row.id}
            selected={selected?.rowId === row.id && selected?.sectionId === block.id}
            dispatch={dispatch}
          />
        ))}
      </div>

      {/* Row visibility toggle */}
      <button
        type="button"
        onClick={() => dispatch({ type: "TOGGLE_ROW", rowId: row.id })}
        title={row.enabled ? "Hide this row" : "Show this row"}
        className="shrink-0 rounded p-1.5 text-zinc-600 transition hover:bg-zinc-700 hover:text-zinc-200"
      >
        {row.enabled ? <Eye size={13} /> : <EyeOff size={13} />}
      </button>
    </div>
  )
}

// ── Config panel ──────────────────────────────────────────────────

function ConfigPanel({ state, dispatch }: { state: State; dispatch: React.Dispatch<Action> }) {
  const { selected, config } = state

  if (!selected) {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-4 text-center">
          <LayoutGrid size={20} className="mx-auto mb-2 text-zinc-600" />
          <p className="text-xs font-semibold text-zinc-400">Click a section block</p>
          <p className="mt-0.5 text-[11px] text-zinc-600">to configure its width, size, and style</p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-2">
          {(["news", "content", "ads", "utility"] as const).map((group) => {
            const count = config.rows
              .flatMap((r) => r.sections)
              .filter((s) => DEFS[s.id].group === group && s.enabled).length
            const colors = { news: "#3b82f6", content: "#059669", ads: "#d97706", utility: "#7c3aed" }
            return (
              <div key={group} className="rounded-lg border border-zinc-700 bg-zinc-800/40 px-3 py-2">
                <div className="mb-1 h-1.5 w-6 rounded-full" style={{ backgroundColor: colors[group] }} />
                <p className="text-[10px] font-bold capitalize text-zinc-300">{group}</p>
                <p className="text-lg font-bold" style={{ color: colors[group] }}>{count}</p>
              </div>
            )
          })}
        </div>

        <MiniPreview config={config} selected={null} />
      </div>
    )
  }

  const row = config.rows.find((r) => r.id === selected.rowId)
  const block = row?.sections.find((s) => s.id === selected.sectionId)
  if (!row || !block) return null

  const def = DEFS[block.id]
  const otherActiveSpan = row.sections
    .filter((s) => s.id !== block.id && s.enabled)
    .reduce((sum, s) => sum + s.colSpan, 0)

  return (
    <div className="flex flex-col gap-3">
      {/* Section header */}
      <div
        className="flex items-center gap-3 rounded-lg p-3"
        style={{ backgroundColor: def.color + "1a", border: `1px solid ${def.color}44` }}
      >
        <span className="text-lg leading-none">{def.icon}</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-white">{def.label}</p>
          <p className="text-[10px] text-zinc-400">{def.description}</p>
        </div>
        <button
          type="button"
          onClick={() => dispatch({ type: "SELECT", sel: null })}
          className="shrink-0 rounded p-1 text-zinc-500 hover:text-zinc-300"
        >
          <X size={13} />
        </button>
      </div>

      {/* Visible toggle */}
      <div className="flex items-center justify-between rounded-lg border border-zinc-700 px-3 py-2.5">
        <div>
          <p className="text-xs font-semibold text-zinc-200">Show on Homepage</p>
          <p className="text-[10px] text-zinc-500">{block.enabled ? "Visible" : "Hidden"}</p>
        </div>
        <button
          type="button"
          onClick={() => dispatch({ type: "TOGGLE_SECTION", rowId: selected.rowId, sectionId: selected.sectionId })}
          className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${block.enabled ? "bg-blue-600" : "bg-zinc-700"}`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${block.enabled ? "translate-x-4" : "translate-x-0.5"}`}
          />
        </button>
      </div>

      {/* Width selector */}
      <div className="rounded-lg border border-zinc-700 p-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold text-zinc-200">Column Width</p>
          <span className="text-[10px] text-zinc-500">{block.colSpan}/12 columns</span>
        </div>
        {/* Visual width bar */}
        <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-zinc-700">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${(block.colSpan / 12) * 100}%`, backgroundColor: def.color }}
          />
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {SPAN_OPTS.map((opt) => {
            const fits = otherActiveSpan + opt.value <= 12
            const active = block.colSpan === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                disabled={!fits}
                title={fits ? opt.desc : `Too wide — other sections use ${otherActiveSpan} cols`}
                onClick={() => dispatch({ type: "SET_SPAN", rowId: selected.rowId, sectionId: selected.sectionId, colSpan: opt.value })}
                className={`rounded px-2 py-2 text-[11px] font-bold transition
                  ${active ? "text-white shadow-sm" : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"}
                  ${!fits ? "cursor-not-allowed opacity-25" : ""}
                `}
                style={active ? { backgroundColor: def.color } : undefined}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Size/density */}
      <div className="rounded-lg border border-zinc-700 p-3">
        <p className="mb-2 text-xs font-semibold text-zinc-200">Content Density</p>
        <div className="grid grid-cols-3 gap-1.5">
          {(["compact", "normal", "large"] as SectionSize[]).map((sz) => (
            <button
              key={sz}
              type="button"
              onClick={() => dispatch({ type: "SET_SIZE", rowId: selected.rowId, sectionId: selected.sectionId, size: sz })}
              className={`rounded px-2 py-2 text-[11px] font-semibold capitalize transition
                ${block.size === sz ? "text-white" : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"}
              `}
              style={block.size === sz ? { backgroundColor: def.color } : undefined}
            >
              {sz}
            </button>
          ))}
        </div>
      </div>

      {/* Variant picker (hero only, etc.) */}
      {def.variants && def.variants.length > 0 && (
        <div className="rounded-lg border border-zinc-700 p-3">
          <p className="mb-2 text-xs font-semibold text-zinc-200">Display Style</p>
          <div className="flex flex-col gap-1.5">
            {def.variants.map((v) => {
              const active = (block.variant ?? def.variants![0].value) === v.value
              return (
                <button
                  key={v.value}
                  type="button"
                  onClick={() => dispatch({ type: "SET_VARIANT", rowId: selected.rowId, sectionId: selected.sectionId, variant: v.value })}
                  className={`flex items-center gap-2 rounded px-3 py-2.5 text-left text-[11px] font-semibold transition
                    ${active ? "text-white" : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"}
                  `}
                  style={active ? { backgroundColor: def.color } : undefined}
                >
                  <span className={`h-2 w-2 shrink-0 rounded-full border-2 ${active ? "border-white bg-white/50" : "border-zinc-500"}`} />
                  {v.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Mini preview at bottom */}
      <MiniPreview config={config} selected={selected} />
    </div>
  )
}

// ── Main builder ──────────────────────────────────────────────────

export function BuilderClient({ initialConfig }: { initialConfig: LayoutConfig }) {
  const [state, dispatch] = useReducer(reducer, {
    config: initialConfig,
    selected: null,
    past: [],
    future: [],
    dirty: false,
  } satisfies State)

  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [justSaved, setJustSaved] = useState(false)

  const handleDragStart = useCallback((id: string) => setDraggedId(id), [])
  const handleDragOver = useCallback(
    (e: React.DragEvent, id: string) => {
      e.preventDefault()
      if (id !== draggedId) setDragOverId(id)
    },
    [draggedId],
  )
  const handleDrop = useCallback(
    (targetId: string) => {
      if (draggedId && draggedId !== targetId) {
        const rows = [...state.config.rows]
        const fi = rows.findIndex((r) => r.id === draggedId)
        const ti = rows.findIndex((r) => r.id === targetId)
        const [moved] = rows.splice(fi, 1)
        rows.splice(ti, 0, moved)
        dispatch({ type: "REORDER", rows })
      }
      setDraggedId(null)
      setDragOverId(null)
    },
    [draggedId, state.config.rows],
  )

  const handleSave = async () => {
    setSaving(true)
    setSaveError(null)
    const result = await saveLayoutConfigAction(state.config)
    setSaving(false)
    if (result?.error) {
      setSaveError(result.error)
    } else {
      dispatch({ type: "MARK_SAVED" })
      setJustSaved(true)
      setTimeout(() => setJustSaved(false), 3500)
    }
  }

  const activeRows = state.config.rows.filter((r) => r.enabled).length
  const hiddenRows = state.config.rows.length - activeRows

  return (
    <div
      className="flex h-screen flex-col overflow-hidden bg-zinc-950 text-zinc-100"
      onDragEnd={() => { setDraggedId(null); setDragOverId(null) }}
    >
      {/* ── Top bar ───────────────────────────────────────────── */}
      <header className="flex shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 py-2.5">
        <div className="flex items-center gap-3">
          <a
            href="/admin/homepage"
            className="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-200"
          >
            <ChevronLeft size={13} />
            Controls
          </a>
          <span className="text-zinc-700">|</span>
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-blue-600">
              <Zap size={11} className="text-white" />
            </div>
            <span className="text-sm font-bold">Visual Layout Builder</span>
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-400">
              Live
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Undo */}
          <button
            type="button"
            onClick={() => dispatch({ type: "UNDO" })}
            disabled={state.past.length === 0}
            title={`Undo (${state.past.length} steps)`}
            className="rounded p-1.5 text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-25"
          >
            <RotateCcw size={14} />
          </button>
          {/* Redo */}
          <button
            type="button"
            onClick={() => dispatch({ type: "REDO" })}
            disabled={state.future.length === 0}
            title={`Redo (${state.future.length} steps)`}
            className="rounded p-1.5 text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-25"
          >
            <RotateCw size={14} />
          </button>

          <div className="mx-2 h-4 w-px bg-zinc-700" />

          {/* Save feedback */}
          {justSaved && (
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400">
              <CheckCircle2 size={12} />
              Published
            </div>
          )}
          {saveError && (
            <div className="flex max-w-[200px] items-center gap-1 rounded-full bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-400">
              <AlertCircle size={12} className="shrink-0" />
              <span className="truncate">{saveError}</span>
            </div>
          )}

          {/* Publish button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !state.dirty}
            className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-semibold transition
              ${state.dirty && !saving
                ? "bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-700"
                : "cursor-not-allowed bg-zinc-800 text-zinc-600"
              }
            `}
          >
            <Save size={13} />
            {saving ? "Publishing…" : "Publish Changes"}
          </button>
        </div>
      </header>

      {/* ── Main area ─────────────────────────────────────────── */}
      <div className="flex min-h-0 flex-1 overflow-hidden">

        {/* Canvas */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden border-r border-zinc-800">
          {/* Canvas bar */}
          <div className="shrink-0 border-b border-zinc-800 bg-zinc-900/80 px-4 py-1.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Layout Canvas &nbsp;·&nbsp; 12-column grid
              &nbsp;·&nbsp; <span className="text-zinc-400">{activeRows} visible rows</span>
              {hiddenRows > 0 && <span className="text-zinc-600"> · {hiddenRows} hidden</span>}
              &nbsp;·&nbsp; Drag
              <GripVertical size={9} className="inline mx-0.5 mb-0.5" />
              to reorder · Click a block to configure
            </p>
          </div>

          {/* Scrollable row list */}
          <div className="flex-1 overflow-y-auto p-4">
            <div
              className="space-y-2"
              onDragOver={(e) => e.preventDefault()}
            >
              {state.config.rows.map((row) => (
                <RowItem
                  key={row.id}
                  row={row}
                  selected={state.selected}
                  isDragOver={dragOverId === row.id && draggedId !== row.id}
                  dispatch={dispatch}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                />
              ))}
            </div>

            {/* Column guide */}
            <div className="mt-4 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
              <div className="px-3 py-1.5">
                <p className="mb-1.5 text-[9px] font-bold uppercase tracking-wider text-zinc-600">Column guide</p>
                <div className="flex gap-1">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="flex-1 rounded bg-zinc-700/40 py-1.5 text-center text-[8px] text-zinc-600">{i + 1}</div>
                  ))}
                </div>
                <div className="mt-1 grid grid-cols-3 gap-1 text-center text-[9px] text-zinc-600">
                  <span>¼=3</span><span>½=6</span><span>Full=12</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Config panel */}
        <aside className="flex w-[280px] shrink-0 flex-col overflow-hidden border-zinc-800 bg-zinc-900">
          {/* Panel header */}
          <div className="shrink-0 border-b border-zinc-800 bg-zinc-900 px-4 py-1.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              {state.selected
                ? `Configure — ${DEFS[state.selected.sectionId].label}`
                : "Overview & Preview"}
            </p>
          </div>

          {/* Scrollable config content */}
          <div className="flex-1 overflow-y-auto p-3">
            <ConfigPanel state={state} dispatch={dispatch} />
          </div>
        </aside>
      </div>

      {/* ── Status bar ────────────────────────────────────────── */}
      <footer className="flex shrink-0 items-center justify-between border-t border-zinc-800 bg-zinc-900 px-4 py-1">
        <p className="text-[10px] text-zinc-600">
          {state.dirty
            ? <span className="text-amber-500">● Unsaved changes</span>
            : <span className="text-emerald-600">✓ All changes saved</span>
          }
          {" "}&nbsp;·&nbsp; {state.past.length} undo / {state.future.length} redo
        </p>
        <p className="text-[10px] text-zinc-700">newmarket.co.in · Visual Layout Builder</p>
      </footer>
    </div>
  )
}
