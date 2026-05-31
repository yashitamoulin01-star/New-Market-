"use client"

import { useReducer, useState, useCallback, useRef, useEffect } from "react"
import {
  GripVertical, Eye, EyeOff, RotateCcw, RotateCw, Save,
  CheckCircle2, AlertCircle, X, Zap, ChevronLeft,
  TriangleAlert, Wrench, ChevronUp, ChevronDown, Layers,
  SlidersHorizontal, MousePointer2, Maximize2, RefreshCw,
} from "lucide-react"
import type {
  LayoutConfig, LayoutRow, SectionBlock, SectionId, ColSpan, SectionSize,
} from "@/lib/supabase/layout-config"
import {
  saveLayoutConfigAction,
  fetchBuilderArticlesAction,
  setBuilderHomepageSlotAction,
  toggleBuilderArticleFlagAction,
  type BuilderArticle,
} from "./actions"

// ═══════════════════════════════════════════════════════════════
// SECTION DEFINITIONS
// ═══════════════════════════════════════════════════════════════

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

const NEWS_SECTION_IDS: ReadonlySet<SectionId> = new Set([
  "hero", "mini_grid", "trending", "local_updates",
])

const SPAN_OPTS: { value: ColSpan; label: string }[] = [
  { value: 3,  label: "¼" },
  { value: 4,  label: "⅓" },
  { value: 6,  label: "½" },
  { value: 8,  label: "⅔" },
  { value: 9,  label: "¾" },
  { value: 12, label: "Full" },
]

// ═══════════════════════════════════════════════════════════════
// GRID ALGORITHMS
// ═══════════════════════════════════════════════════════════════

const VALID_SPANS: ColSpan[] = [3, 4, 6, 8, 9, 12]

function snapToSpan(n: number): ColSpan {
  const clamped = Math.max(3, Math.min(12, n))
  return VALID_SPANS.reduce((best, s) =>
    Math.abs(s - clamped) < Math.abs(best - clamped) ? s : best
  )
}

// Intelligent grid: auto-pick density based on column width
function autoSize(colSpan: ColSpan): SectionSize {
  if (colSpan <= 4) return "compact"
  if (colSpan >= 9) return "large"
  return "normal"
}

function rowEnabledSpan(row: LayoutRow): number {
  return row.sections.filter(s => s.enabled).reduce((sum, s) => sum + s.colSpan, 0)
}

function healRow(row: LayoutRow): LayoutRow {
  const enabled = row.sections.filter(s => s.enabled)
  if (enabled.length === 0) return row
  if (enabled.length === 1) {
    return { ...row, sections: row.sections.map(s => s.enabled ? { ...s, colSpan: 12 } : s) }
  }
  const currentTotal = enabled.reduce((sum, s) => sum + s.colSpan, 0)
  const newSpans = new Map<SectionId, ColSpan>()
  let remaining = 12
  enabled.slice(0, -1).forEach(s => {
    const raw = (s.colSpan / currentTotal) * 12
    const minGuarantee = 3 * (enabled.length - newSpans.size - 1)
    const capped = Math.min(raw, remaining - minGuarantee)
    const snapped = snapToSpan(Math.max(3, capped))
    newSpans.set(s.id, snapped)
    remaining -= snapped
  })
  newSpans.set(enabled[enabled.length - 1].id, snapToSpan(Math.max(3, remaining)))
  return {
    ...row,
    sections: row.sections.map(s =>
      s.enabled && newSpans.has(s.id) ? { ...s, colSpan: newSpans.get(s.id)! } : s
    ),
  }
}

function balanceRow(row: LayoutRow, changedId: SectionId, newSpan: ColSpan): LayoutRow {
  const enabled = row.sections.filter(s => s.enabled)
  const siblings = enabled.filter(s => s.id !== changedId)
  if (siblings.length === 0) {
    return { ...row, sections: row.sections.map(s => s.id === changedId ? { ...s, colSpan: snapToSpan(newSpan) } : s) }
  }
  const clampedSpan = snapToSpan(Math.min(newSpan, 12 - siblings.length * 3))
  const sibSpace = 12 - clampedSpan
  const sibTotal = siblings.reduce((sum, s) => sum + s.colSpan, 0)
  const newSibSpans = new Map<SectionId, ColSpan>()
  let distributed = 0
  siblings.slice(0, -1).forEach(s => {
    const raw = (s.colSpan / sibTotal) * sibSpace
    const minOthers = 3 * (siblings.length - newSibSpans.size - 1)
    const snapped = snapToSpan(Math.max(3, Math.min(raw, sibSpace - distributed - minOthers)))
    newSibSpans.set(s.id, snapped)
    distributed += snapped
  })
  newSibSpans.set(siblings[siblings.length - 1].id, snapToSpan(Math.max(3, sibSpace - distributed)))
  return {
    ...row,
    sections: row.sections.map(s => {
      if (s.id === changedId) return { ...s, colSpan: clampedSpan }
      if (s.enabled && newSibSpans.has(s.id)) return { ...s, colSpan: newSibSpans.get(s.id)! }
      return s
    }),
  }
}

function healConfig(config: LayoutConfig): LayoutConfig {
  return { ...config, rows: config.rows.map(healRow) }
}

// ═══════════════════════════════════════════════════════════════
// LAYOUT MODES
// ═══════════════════════════════════════════════════════════════

type LayoutMode = "balanced" | "photo_heavy" | "text_heavy" | "breaking_news" | "minimal" | "ads_heavy" | "election"

type ModeDef = {
  id: LayoutMode
  label: string
  icon: string
  description: string
  palette: string
  apply: (c: LayoutConfig) => LayoutConfig
}

function patch(config: LayoutConfig, patches: Partial<Record<SectionId, Partial<SectionBlock>>>): LayoutConfig {
  return {
    ...config,
    rows: config.rows.map(row => ({
      ...row,
      enabled: row.sections.some(s => patches[s.id] ? patches[s.id]!.enabled !== false : s.enabled)
        ? row.enabled
        : false,
      sections: row.sections.map(s => patches[s.id] ? { ...s, ...patches[s.id] } : s),
    })),
  }
}

const MODES: ModeDef[] = [
  { id: "balanced",      label: "Balanced",       icon: "⚖️", description: "Default newsroom — balanced content and ads",              palette: "#3b82f6", apply: c => c },
  { id: "photo_heavy",   label: "Photo Magazine",  icon: "🖼",  description: "Large images, spacious cards, visual storytelling",       palette: "#8b5cf6", apply: c => healConfig(patch(c, { hero: { enabled: true, colSpan: 8, size: "large", variant: "photo" }, latest_panel: { enabled: true, colSpan: 4, size: "normal" }, mini_grid: { enabled: true, colSpan: 12, size: "large" }, trending: { enabled: true, colSpan: 9, size: "large" }, text_stories: { enabled: false } })) },
  { id: "text_heavy",    label: "Text Newsroom",   icon: "📰", description: "Dense headlines, compact cards, maximum information",      palette: "#64748b", apply: c => healConfig(patch(c, { hero: { enabled: true, colSpan: 6, size: "compact", variant: "text-split" }, latest_panel: { enabled: true, colSpan: 6, size: "compact" }, mini_grid: { enabled: true, colSpan: 8, size: "compact" }, text_stories: { enabled: true, colSpan: 4, size: "compact" }, trending: { enabled: false } })) },
  { id: "breaking_news", label: "Breaking News",   icon: "⚡", description: "Urgent, hero-dominant, ticker prominent, maximum impact", palette: "#dc2626", apply: c => healConfig(patch(c, { ticker: { enabled: true }, hero: { enabled: true, colSpan: 12, size: "large", variant: "photo" }, mini_grid: { enabled: false }, trending: { enabled: false }, text_stories: { enabled: true, colSpan: 8, size: "compact" }, latest_panel: { enabled: true, colSpan: 4, size: "compact" }, top_ad: { enabled: false }, mid_ad: { enabled: false }, bottom_ad: { enabled: false }, youtube: { enabled: false }, jobs_panel: { enabled: false } })) },
  { id: "minimal",       label: "Minimal Clean",   icon: "✦",  description: "No ads, spacious premium layout, pure content focus",     palette: "#0ea5e9", apply: c => healConfig(patch(c, { top_ad: { enabled: false }, mid_ad: { enabled: false }, bottom_ad: { enabled: false }, hero: { enabled: true, colSpan: 8, size: "large", variant: "photo" }, latest_panel: { enabled: true, colSpan: 4, size: "normal" }, community_strip: { enabled: true } })) },
  { id: "ads_heavy",     label: "Ad Optimised",    icon: "📢", description: "All ad slots active, content balanced around ads",        palette: "#d97706", apply: c => healConfig(patch(c, { top_ad: { enabled: true, colSpan: 12, size: "normal" }, mid_ad: { enabled: true, colSpan: 12, size: "normal" }, bottom_ad: { enabled: true, colSpan: 12, size: "normal" }, hero: { enabled: true, colSpan: 8, size: "compact" }, latest_panel: { enabled: true, colSpan: 4, size: "compact" }, mini_grid: { enabled: true, size: "compact" } })) },
  { id: "election",      label: "Election Mode",   icon: "🗳",  description: "Elections widget prominent, voting and civic focus",     palette: "#7c3aed", apply: c => healConfig(patch(c, { elections: { enabled: true, colSpan: 4, size: "large" }, hero: { enabled: true, colSpan: 8, size: "large" }, latest_panel: { enabled: true, colSpan: 4, size: "normal" }, section_links: { enabled: true } })) },
]

// ═══════════════════════════════════════════════════════════════
// STATE MANAGEMENT
// ═══════════════════════════════════════════════════════════════

type Selection = { rowId: string; sectionId: SectionId } | null

type State = {
  config: LayoutConfig
  mode: LayoutMode
  selected: Selection
  past: LayoutConfig[]
  future: LayoutConfig[]
  dirty: boolean
}

type Action =
  | { type: "REORDER"; rows: LayoutRow[] }
  | { type: "TOGGLE_ROW"; rowId: string }
  | { type: "TOGGLE_SECTION"; rowId: string; sectionId: SectionId }
  | { type: "RESIZE_AND_BALANCE"; rowId: string; sectionId: SectionId; colSpan: ColSpan }
  | { type: "SET_SIZE"; rowId: string; sectionId: SectionId; size: SectionSize }
  | { type: "SET_VARIANT"; rowId: string; sectionId: SectionId; variant: string }
  | { type: "HEAL_ROW"; rowId: string }
  | { type: "APPLY_MODE"; mode: LayoutMode; config?: LayoutConfig }
  | { type: "SELECT"; sel: Selection }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "MARK_SAVED" }

function push(past: LayoutConfig[], c: LayoutConfig): LayoutConfig[] {
  return [...past.slice(-30), c]
}

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "REORDER":
      return { ...s, config: { ...s.config, rows: a.rows }, past: push(s.past, s.config), future: [], dirty: true }
    case "TOGGLE_ROW": {
      const rows = s.config.rows.map(r => r.id === a.rowId ? { ...r, enabled: !r.enabled } : r)
      return { ...s, config: { ...s.config, rows }, past: push(s.past, s.config), future: [], dirty: true }
    }
    case "TOGGLE_SECTION": {
      const rows = s.config.rows.map(r => {
        if (r.id !== a.rowId) return r
        const toggled = { ...r, sections: r.sections.map(sec => sec.id === a.sectionId ? { ...sec, enabled: !sec.enabled } : sec) }
        return healRow(toggled)
      })
      return { ...s, config: { ...s.config, rows }, past: push(s.past, s.config), future: [], dirty: true }
    }
    case "RESIZE_AND_BALANCE": {
      const rows = s.config.rows.map(r => {
        if (r.id !== a.rowId) return r
        const balanced = balanceRow(r, a.sectionId, a.colSpan)
        // Intelligent grid: auto-adjust size based on new column width
        return {
          ...balanced,
          sections: balanced.sections.map(sec =>
            sec.enabled ? { ...sec, size: autoSize(sec.colSpan) } : sec
          ),
        }
      })
      return { ...s, config: { ...s.config, rows }, past: push(s.past, s.config), future: [], dirty: true }
    }
    case "SET_SIZE": {
      const rows = s.config.rows.map(r =>
        r.id !== a.rowId ? r : { ...r, sections: r.sections.map(sec => sec.id === a.sectionId ? { ...sec, size: a.size } : sec) }
      )
      return { ...s, config: { ...s.config, rows }, past: push(s.past, s.config), future: [], dirty: true }
    }
    case "SET_VARIANT": {
      const rows = s.config.rows.map(r =>
        r.id !== a.rowId ? r : { ...r, sections: r.sections.map(sec => sec.id === a.sectionId ? { ...sec, variant: a.variant } : sec) }
      )
      return { ...s, config: { ...s.config, rows }, past: push(s.past, s.config), future: [], dirty: true }
    }
    case "HEAL_ROW": {
      const rows = s.config.rows.map(r => r.id === a.rowId ? healRow(r) : r)
      return { ...s, config: { ...s.config, rows }, past: push(s.past, s.config), future: [], dirty: true }
    }
    case "APPLY_MODE":
      return { ...s, config: a.config ?? s.config, mode: a.mode, past: push(s.past, s.config), future: [], dirty: true }
    case "SELECT":
      return { ...s, selected: a.sel }
    case "UNDO":
      if (!s.past.length) return s
      return { ...s, config: s.past[s.past.length - 1], past: s.past.slice(0, -1), future: [s.config, ...s.future], dirty: true }
    case "REDO":
      if (!s.future.length) return s
      return { ...s, config: s.future[0], past: push(s.past, s.config), future: s.future.slice(1), dirty: true }
    case "MARK_SAVED":
      return { ...s, dirty: false }
    default:
      return s
  }
}

// ═══════════════════════════════════════════════════════════════
// RESIZE HANDLE
// ═══════════════════════════════════════════════════════════════

function ResizeHandle({
  currentSpan, rowId, sectionId, rowRef, onPreview, onCommit,
}: {
  currentSpan: ColSpan
  rowId: string
  sectionId: SectionId
  rowRef: React.RefObject<HTMLDivElement | null>
  onPreview: (span: ColSpan) => void
  onCommit: (rowId: string, sectionId: SectionId, span: ColSpan) => void
}) {
  const spanRef = useRef(currentSpan)
  spanRef.current = currentSpan

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    const container = rowRef.current
    if (!container) return
    const colWidth = container.offsetWidth / 12
    const startX = e.clientX
    const startSpan = spanRef.current
    let lastSnapped = startSpan

    const onMove = (ev: MouseEvent) => {
      const snapped = snapToSpan(startSpan + (ev.clientX - startX) / colWidth)
      if (snapped !== lastSnapped) { lastSnapped = snapped; onPreview(snapped) }
    }
    const onUp = () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
      onCommit(rowId, sectionId, lastSnapped)
    }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
  }, [rowId, sectionId, rowRef, onPreview, onCommit])

  return (
    <div
      onMouseDown={onMouseDown}
      title="Drag to resize"
      className="absolute right-0 top-0 bottom-0 z-20 flex w-3 cursor-col-resize items-center justify-center group/rh select-none"
    >
      <div className="h-6 w-[3px] rounded-full bg-white/20 transition-all group-hover/rh:h-full group-hover/rh:bg-white/70" />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// SECTION CELL (Layers panel)
// ═══════════════════════════════════════════════════════════════

function SectionCell({
  block, rowId, selected, displaySpan, rowRef, dispatch, onPreview, onCommit,
}: {
  block: SectionBlock; rowId: string; selected: boolean; displaySpan: ColSpan
  rowRef: React.RefObject<HTMLDivElement | null>; dispatch: React.Dispatch<Action>
  onPreview: (span: ColSpan) => void; onCommit: (rowId: string, sectionId: SectionId, span: ColSpan) => void
}) {
  const def = DEFS[block.id]
  return (
    <div className="relative flex min-w-0 items-stretch transition-all duration-150" style={{ width: `${(displaySpan / 12) * 100}%` }}>
      <button
        type="button"
        onClick={() => dispatch({ type: "SELECT", sel: selected ? null : { rowId, sectionId: block.id } })}
        title={`${def.label} · ${displaySpan}/12 columns`}
        style={{ backgroundColor: block.enabled ? def.color + "cc" : "#27272a", boxShadow: selected ? `0 0 0 2px #93c5fd, 0 0 0 4px #1e3a5f` : undefined }}
        className={`flex flex-1 items-center gap-1.5 overflow-hidden rounded px-2 py-0 transition-all min-h-[40px] ${block.enabled ? "text-white hover:brightness-125" : "text-zinc-500 hover:bg-zinc-700"} ${selected ? "ring-2 ring-blue-300" : ""}`}
      >
        <span className="shrink-0 text-sm leading-none">{def.icon}</span>
        <div className="min-w-0 flex-1 text-left">
          <p className="truncate text-[10px] font-bold leading-tight">{def.label}</p>
          <p className="text-[8px] opacity-60">{displaySpan}/12</p>
        </div>
        {!block.enabled && <span className="ml-auto shrink-0 rounded bg-zinc-800 px-1 text-[8px] text-zinc-500">OFF</span>}
      </button>
      {block.enabled && (
        <ResizeHandle currentSpan={displaySpan} rowId={rowId} sectionId={block.id} rowRef={rowRef} onPreview={onPreview} onCommit={onCommit} />
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// BALANCE CHIP
// ═══════════════════════════════════════════════════════════════

function BalanceChip({ row, dispatch }: { row: LayoutRow; dispatch: React.Dispatch<Action> }) {
  const enabled = row.sections.filter(s => s.enabled)
  if (!enabled.length) return null
  const total = enabled.reduce((sum, s) => sum + s.colSpan, 0)
  if (total === 12) return <span className="shrink-0 text-[8px] text-emerald-500 opacity-50">✓12</span>
  return (
    <button type="button" onClick={() => dispatch({ type: "HEAL_ROW", rowId: row.id })}
      title={`Row uses ${total}/12 cols — click to fix`}
      className="flex shrink-0 items-center gap-1 rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-400 hover:bg-amber-500/30 transition">
      <TriangleAlert size={9} />{total}/12<Wrench size={9} />
    </button>
  )
}

// ═══════════════════════════════════════════════════════════════
// ROW ITEM (Layers panel)
// ═══════════════════════════════════════════════════════════════

function RowItem({
  row, selected, isDragOver, resizePreview, dispatch,
  onDragStart, onDragOver, onDrop, onPreview, onCommit,
}: {
  row: LayoutRow; selected: Selection; isDragOver: boolean
  resizePreview: { sectionId: SectionId; colSpan: ColSpan } | null
  dispatch: React.Dispatch<Action>
  onDragStart: (id: string) => void; onDragOver: (e: React.DragEvent, id: string) => void
  onDrop: (id: string) => void; onPreview: (sectionId: SectionId, colSpan: ColSpan) => void
  onCommit: (rowId: string, sectionId: SectionId, colSpan: ColSpan) => void
}) {
  const rowRef = useRef<HTMLDivElement>(null)
  const displayRow = resizePreview ? balanceRow(row, resizePreview.sectionId, resizePreview.colSpan) : row

  return (
    <div
      draggable onDragStart={() => onDragStart(row.id)} onDragOver={e => onDragOver(e, row.id)} onDrop={e => { e.preventDefault(); onDrop(row.id) }}
      className={`group flex items-center gap-1.5 rounded-lg border p-1.5 transition-all cursor-grab active:cursor-grabbing select-none ${row.enabled ? "border-zinc-700 bg-zinc-800/80" : "border-zinc-700/30 bg-zinc-800/20 opacity-40"} ${isDragOver ? "border-blue-400 bg-blue-900/30 scale-[1.01]" : "hover:border-zinc-600"}`}
    >
      <GripVertical size={12} className="shrink-0 text-zinc-600 group-hover:text-zinc-400" />
      <div ref={rowRef} className="flex min-w-0 flex-1 gap-1">
        {displayRow.sections.map(block => (
          <SectionCell key={block.id} block={block} rowId={row.id} displaySpan={block.colSpan}
            selected={selected?.rowId === row.id && selected?.sectionId === block.id}
            rowRef={rowRef} dispatch={dispatch}
            onPreview={span => onPreview(block.id, span)}
            onCommit={onCommit}
          />
        ))}
      </div>
      <BalanceChip row={displayRow} dispatch={dispatch} />
      <button type="button" onClick={() => dispatch({ type: "TOGGLE_ROW", rowId: row.id })}
        className="shrink-0 rounded p-1 text-zinc-600 hover:bg-zinc-700 hover:text-zinc-300 transition"
        title={row.enabled ? "Hide" : "Show"}>
        {row.enabled ? <Eye size={11} /> : <EyeOff size={11} />}
      </button>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// MINI PREVIEW (page schematic)
// ═══════════════════════════════════════════════════════════════

function MiniPreview({ config, selected }: { config: LayoutConfig; selected: Selection }) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-700/50 bg-zinc-950">
      <div className="border-b border-zinc-700/50 px-3 py-1.5">
        <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-600">Page Schematic</p>
      </div>
      <div className="space-y-[2px] p-2">
        {config.rows.map(row => {
          const vis = row.enabled ? row.sections.filter(s => s.enabled) : []
          return (
            <div key={row.id} className="flex gap-[2px]">
              {!row.enabled
                ? <div className="h-2.5 w-full rounded-[2px] bg-zinc-800/40" />
                : vis.map(b => (
                    <div key={b.id}
                      style={{ width: `${(b.colSpan / 12) * 100}%`, backgroundColor: DEFS[b.id].color }}
                      className={`h-2.5 rounded-[2px] transition-all ${selected?.rowId === row.id && selected?.sectionId === b.id ? "brightness-150 ring-1 ring-white/60" : "opacity-70"}`}
                      title={`${DEFS[b.id].label} · ${b.colSpan}/12`}
                    />
                  ))
              }
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// CONTENT PICKER — article assignment for news sections
// ═══════════════════════════════════════════════════════════════

function timeAgoShort(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3600000)
  const d = Math.floor(diff / 86400000)
  if (h < 1) return "now"
  if (h < 24) return `${h}h`
  if (d < 7) return `${d}d`
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
}

type ContentPickerMode = "headline" | "featured" | "trending" | null

function getPickerMode(sectionId: SectionId): ContentPickerMode {
  if (sectionId === "hero")         return "headline"
  if (sectionId === "mini_grid")    return "featured"
  if (sectionId === "trending")     return "trending"
  if (sectionId === "local_updates") return "featured"
  return null
}

function ContentPicker({ sectionId }: { sectionId: SectionId }) {
  const mode = getPickerMode(sectionId)
  const [articles, setArticles] = useState<BuilderArticle[]>([])
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState<string | null>(null)
  const [err, setErr]           = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true); setErr(null)
    const { items, error } = await fetchBuilderArticlesAction()
    if (error) setErr(error)
    else setArticles(items)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  if (!mode) return null

  function isAssigned(a: BuilderArticle): boolean {
    if (mode === "headline") return a.homepage_slot === "headline"
    if (mode === "featured") return a.is_featured
    if (mode === "trending") return a.is_trending
    return false
  }

  async function toggle(a: BuilderArticle) {
    if (saving) return
    setSaving(a.id)
    const currently = isAssigned(a)

    let res: { error?: string } = {}
    if (mode === "headline") {
      res = await setBuilderHomepageSlotAction(a.id, currently ? null : "headline", true)
      if (!res.error) {
        setArticles(prev => prev.map(x => ({
          ...x,
          homepage_slot: x.id === a.id
            ? (currently ? null : "headline")
            : (x.homepage_slot === "headline" ? null : x.homepage_slot),
        })))
      }
    } else if (mode === "featured") {
      res = await toggleBuilderArticleFlagAction(a.id, "is_featured", !currently)
      if (!res.error) setArticles(prev => prev.map(x => x.id === a.id ? { ...x, is_featured: !currently } : x))
    } else if (mode === "trending") {
      res = await toggleBuilderArticleFlagAction(a.id, "is_trending", !currently)
      if (!res.error) setArticles(prev => prev.map(x => x.id === a.id ? { ...x, is_trending: !currently } : x))
    }

    if (res.error) setErr(res.error)
    setSaving(null)
  }

  const modeLabels: Record<Exclude<ContentPickerMode, null>, { title: string; hint: string; badge: string }> = {
    headline: { title: "Hero Article",       hint: "Select 1 article — becomes the main featured story",    badge: "HERO"     },
    featured: { title: "Featured Articles",  hint: "Toggle articles to appear in the story grid",           badge: "FEATURED" },
    trending: { title: "Trending Articles",  hint: "Toggle articles to appear in the trending strip",       badge: "TRENDING" },
  }
  const { title, hint, badge } = modeLabels[mode]

  const assigned = articles.filter(isAssigned)

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-700/50 bg-zinc-800/10">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-zinc-700/50 bg-zinc-800/30 px-3 py-2">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="rounded bg-blue-600/20 px-1.5 py-0.5 text-[8px] font-bold text-blue-400">{badge}</span>
            <p className="text-[11px] font-bold text-zinc-200">{title}</p>
          </div>
          <p className="mt-0.5 text-[9px] text-zinc-600">{hint}</p>
        </div>
        <button type="button" onClick={load} title="Refresh" className="mt-0.5 text-zinc-600 hover:text-zinc-400 transition">
          <RefreshCw size={11} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Assigned summary */}
      {assigned.length > 0 && (
        <div className="border-b border-zinc-700/30 bg-blue-500/5 px-3 py-1.5">
          <p className="text-[9px] font-semibold text-blue-400">{assigned.length} article{assigned.length > 1 ? "s" : ""} assigned</p>
        </div>
      )}

      {err && (
        <div className="border-b border-red-500/20 bg-red-500/10 px-3 py-1.5">
          <p className="text-[9px] text-red-400">{err}</p>
        </div>
      )}

      {/* Article list */}
      <div className="max-h-[260px] overflow-y-auto divide-y divide-zinc-800/50">
        {loading && !articles.length && (
          <div className="flex items-center justify-center gap-2 py-6">
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-zinc-700 border-t-blue-500" />
            <span className="text-[10px] text-zinc-600">Loading articles…</span>
          </div>
        )}
        {!loading && articles.length === 0 && (
          <div className="py-5 text-center text-[10px] text-zinc-600">No published articles yet</div>
        )}
        {articles.map(a => {
          const assigned = isAssigned(a)
          const isSaving = saving === a.id
          const def = assigned
            ? { bg: "bg-blue-500/10 hover:bg-blue-500/15", ring: "ring-1 ring-blue-500/30", check: "border-blue-500 bg-blue-500" }
            : { bg: "hover:bg-zinc-800/40", ring: "", check: "border-zinc-600" }

          return (
            <button
              key={a.id}
              type="button"
              onClick={() => toggle(a)}
              disabled={!!isSaving}
              className={`flex w-full items-start gap-2.5 px-3 py-2 text-left transition ${def.bg} ${def.ring}`}
            >
              {/* Check indicator */}
              <div className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-all ${def.check}`}>
                {assigned && <span className="text-[8px] font-bold text-white">✓</span>}
              </div>

              {/* Thumbnail */}
              {a.cover_image_url ? (
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-zinc-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.cover_image_url} alt="" className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-zinc-800 text-[16px]">
                  {a.is_breaking ? "⚡" : "📄"}
                </div>
              )}

              {/* Title + meta */}
              <div className="min-w-0 flex-1">
                <p className={`line-clamp-2 text-[11px] font-semibold leading-snug transition-colors ${assigned ? "text-blue-200" : "text-zinc-300"}`}>
                  {a.title}
                </p>
                <div className="mt-0.5 flex flex-wrap items-center gap-1 text-[8px] text-zinc-600">
                  {a.is_breaking && <span className="font-bold text-red-500">⚡ Breaking</span>}
                  {a.is_featured && <span className="text-amber-500">Featured</span>}
                  {a.is_trending && <span className="text-orange-500">Trending</span>}
                  {a.published_at && <span>{timeAgoShort(a.published_at)}</span>}
                </div>
              </div>

              {isSaving && <div className="mt-1 h-3 w-3 animate-spin rounded-full border-2 border-zinc-600 border-t-blue-400" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// CONFIG PANEL (Inspector section controls)
// ═══════════════════════════════════════════════════════════════

function ConfigPanel({ state, dispatch }: { state: State; dispatch: React.Dispatch<Action> }) {
  const { selected, config } = state
  if (!selected) return null

  const row   = config.rows.find(r => r.id === selected.rowId)
  const block = row?.sections.find(s => s.id === selected.sectionId)
  if (!row || !block) return null

  const def         = DEFS[block.id]
  const otherActive = row.sections.filter(s => s.id !== block.id && s.enabled).reduce((sum, s) => sum + s.colSpan, 0)
  const siblings    = row.sections.filter(s => s.enabled)

  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="flex items-center gap-3 rounded-xl p-3" style={{ backgroundColor: def.color + "18", border: `1px solid ${def.color}40` }}>
        <span className="text-xl">{def.icon}</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-white">{def.label}</p>
          <p className="text-[10px] text-zinc-400">{def.description}</p>
        </div>
        <button type="button" onClick={() => dispatch({ type: "SELECT", sel: null })}
          className="shrink-0 rounded p-1 text-zinc-500 hover:bg-zinc-700/50 hover:text-zinc-300 transition">
          <X size={13} />
        </button>
      </div>

      {/* Section switcher (multi-section rows) */}
      {siblings.length > 1 && (
        <div className="flex gap-1 rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-1">
          {siblings.map(s => {
            const d = DEFS[s.id]
            const active = selected.sectionId === s.id
            return (
              <button key={s.id} type="button"
                onClick={() => dispatch({ type: "SELECT", sel: { rowId: selected.rowId, sectionId: s.id } })}
                style={active ? { backgroundColor: d.color } : undefined}
                className={`flex flex-1 items-center justify-center gap-1 rounded py-1.5 text-[10px] font-bold transition ${active ? "text-white" : "text-zinc-500 hover:text-zinc-300"}`}>
                <span>{d.icon}</span>
                <span className="truncate">{d.label}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* Visible toggle */}
      <div className="flex items-center justify-between rounded-xl border border-zinc-700/50 bg-zinc-800/30 px-3 py-2.5">
        <div>
          <p className="text-xs font-semibold text-zinc-200">Visible on homepage</p>
          <p className="text-[10px] text-zinc-500">{block.enabled ? "Showing" : "Hidden"}</p>
        </div>
        <button type="button"
          onClick={() => dispatch({ type: "TOGGLE_SECTION", rowId: selected.rowId, sectionId: selected.sectionId })}
          className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${block.enabled ? "bg-blue-600" : "bg-zinc-700"}`}>
          <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${block.enabled ? "translate-x-4" : "translate-x-0.5"}`} />
        </button>
      </div>

      {/* Column width */}
      <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/30 p-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold text-zinc-200">Column Width</p>
          <span className="text-[10px] text-zinc-500">{block.colSpan}/12 · {Math.round((block.colSpan / 12) * 100)}%</span>
        </div>
        <div className="mb-2.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-700">
          <div className="h-full rounded-full transition-all" style={{ width: `${(block.colSpan / 12) * 100}%`, backgroundColor: def.color }} />
        </div>
        <div className="grid grid-cols-3 gap-1">
          {SPAN_OPTS.map(o => {
            const fits  = otherActive + o.value <= 12
            const active = block.colSpan === o.value
            return (
              <button key={o.value} type="button" disabled={!fits}
                onClick={() => dispatch({ type: "RESIZE_AND_BALANCE", rowId: selected.rowId, sectionId: selected.sectionId, colSpan: o.value })}
                className={`rounded py-1.5 text-[11px] font-bold transition ${active ? "text-white" : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"} ${!fits ? "cursor-not-allowed opacity-20" : ""}`}
                style={active ? { backgroundColor: def.color } : undefined}>
                {o.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content density */}
      <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/30 p-3">
        <p className="mb-2 text-xs font-semibold text-zinc-200">Content Density</p>
        <div className="grid grid-cols-3 gap-1">
          {(["compact", "normal", "large"] as SectionSize[]).map(sz => (
            <button key={sz} type="button"
              onClick={() => dispatch({ type: "SET_SIZE", rowId: selected.rowId, sectionId: selected.sectionId, size: sz })}
              className={`rounded py-1.5 text-[11px] font-semibold capitalize transition ${block.size === sz ? "text-white" : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"}`}
              style={block.size === sz ? { backgroundColor: def.color } : undefined}>
              {sz}
            </button>
          ))}
        </div>
      </div>

      {/* Display variant */}
      {def.variants && (
        <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/30 p-3">
          <p className="mb-2 text-xs font-semibold text-zinc-200">Display Style</p>
          <div className="space-y-1.5">
            {def.variants.map(v => {
              const active = (block.variant ?? def.variants![0].value) === v.value
              return (
                <button key={v.value} type="button"
                  onClick={() => dispatch({ type: "SET_VARIANT", rowId: selected.rowId, sectionId: selected.sectionId, variant: v.value })}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[11px] font-semibold transition ${active ? "text-white" : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"}`}
                  style={active ? { backgroundColor: def.color } : undefined}>
                  <span className={`h-2 w-2 shrink-0 rounded-full border-2 ${active ? "border-white bg-white/50" : "border-zinc-500"}`} />
                  {v.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Content placement — only for news sections that support it */}
      {NEWS_SECTION_IDS.has(block.id) && getPickerMode(block.id) && (
        <ContentPicker sectionId={block.id} />
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// SECTION OVERLAY — visual editing layer over the iframe
// ═══════════════════════════════════════════════════════════════

function SectionOverlay({
  rowId, row, rect, zoom, selected, dispatch, allRows,
}: {
  rowId: string; row: LayoutRow | undefined; rect: { x: number; y: number; width: number; height: number }
  zoom: number; selected: Selection; dispatch: React.Dispatch<Action>; allRows: LayoutRow[]
}) {
  const [hovered, setHovered] = useState(false)
  if (!row) return null

  const rowIndex     = allRows.findIndex(r => r.id === rowId)
  const canMoveUp    = rowIndex > 0
  const canMoveDown  = rowIndex < allRows.length - 1
  const isSelected   = selected?.rowId === rowId
  const enabledSects = row.sections.filter(s => s.enabled)
  const isActive     = hovered || isSelected

  const left   = Math.round(rect.x * zoom)
  const top    = Math.round(rect.y * zoom)
  const width  = Math.round(rect.width * zoom)
  const height = Math.round(rect.height * zoom)

  function moveRow(dir: 1 | -1) {
    const rows = [...allRows]
    const [r] = rows.splice(rowIndex, 1)
    rows.splice(rowIndex + dir, 0, r)
    dispatch({ type: "REORDER", rows })
  }

  return (
    <div
      style={{ position: "absolute", left, top, width, height }}
      className="pointer-events-auto group/overlay"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={e => {
        e.stopPropagation()
        if (!enabledSects.length) return
        const first = enabledSects[0]
        if (isSelected && selected?.sectionId === first.id && enabledSects.length === 1) {
          dispatch({ type: "SELECT", sel: null })
        } else if (!isSelected) {
          dispatch({ type: "SELECT", sel: { rowId, sectionId: first.id } })
        }
      }}
    >
      {/* Outline ring */}
      <div className={`absolute inset-0 rounded pointer-events-none transition-all duration-100 ${
        isSelected ? "ring-[2px] ring-blue-400 ring-inset bg-blue-500/[0.04]"
        : isActive  ? "ring-[1.5px] ring-blue-400/70 ring-inset bg-blue-500/[0.02]"
                    : "ring-[1px] ring-dashed ring-blue-500/25 ring-inset"
      }`} />

      {/* Section label tabs — float above */}
      {isActive && (
        <div className="absolute left-0 flex items-end gap-0.5 pointer-events-auto z-30"
          style={{ bottom: "100%", paddingBottom: 2 }}
          onClick={e => e.stopPropagation()}>
          {enabledSects.map(block => {
            const def   = DEFS[block.id]
            const isSel = selected?.rowId === rowId && selected?.sectionId === block.id
            return (
              <button key={block.id} type="button"
                onClick={e => { e.stopPropagation(); dispatch({ type: "SELECT", sel: isSel ? null : { rowId, sectionId: block.id } }) }}
                style={{ backgroundColor: def.color }}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded-t-md text-white shadow-lg transition-all text-[9px] whitespace-nowrap ${isSel ? "opacity-100 font-bold" : "opacity-75 hover:opacity-100 font-semibold"}`}>
                <span className="text-[10px] leading-none">{def.icon}</span>
                <span>{def.label}</span>
                {block.colSpan < 12 && <span className="opacity-60 text-[8px]">{block.colSpan}/12</span>}
              </button>
            )
          })}
        </div>
      )}

      {/* Quick actions — top right */}
      {isActive && (
        <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 z-30 pointer-events-auto"
          onClick={e => e.stopPropagation()}>
          {canMoveUp && (
            <button type="button" onClick={() => moveRow(-1)} title="Move up"
              className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-950/90 border border-zinc-700/60 text-zinc-400 hover:text-white hover:border-zinc-400 transition backdrop-blur-sm shadow-lg">
              <ChevronUp size={11} />
            </button>
          )}
          {canMoveDown && (
            <button type="button" onClick={() => moveRow(1)} title="Move down"
              className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-950/90 border border-zinc-700/60 text-zinc-400 hover:text-white hover:border-zinc-400 transition backdrop-blur-sm shadow-lg">
              <ChevronDown size={11} />
            </button>
          )}
          <button type="button" onClick={() => dispatch({ type: "TOGGLE_ROW", rowId })} title="Hide section"
            className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-950/90 border border-zinc-700/60 text-zinc-400 hover:text-red-400 hover:border-red-500/50 transition backdrop-blur-sm shadow-lg">
            <EyeOff size={11} />
          </button>
        </div>
      )}

      {/* Column width bar — bottom edge */}
      {isActive && enabledSects.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 flex h-[3px] overflow-hidden rounded-b pointer-events-none z-20">
          {enabledSects.map(block => (
            <div key={block.id} title={`${DEFS[block.id].label}: ${block.colSpan}/12`}
              style={{ width: `${(block.colSpan / 12) * 100}%`, backgroundColor: DEFS[block.id].color }}
              className={`h-full transition-opacity ${selected?.rowId === rowId && selected?.sectionId === block.id ? "opacity-100" : "opacity-50"}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// LIVE PREVIEW MODAL — fullscreen production preview
// ═══════════════════════════════════════════════════════════════

function LivePreviewModal({
  viewport,
  onViewportChange,
  onClose,
}: {
  viewport: "desktop" | "tablet" | "mobile"
  onViewportChange: (v: "desktop" | "tablet" | "mobile") => void
  onClose: () => void
}) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])

  const widths = { desktop: "100%", tablet: "768px", mobile: "390px" }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-zinc-950">
      {/* Floating control bar */}
      <div className="absolute top-4 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-full border border-zinc-700/60 bg-zinc-900/95 px-3 py-1.5 shadow-2xl backdrop-blur">
        {/* Live dot */}
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[10px] font-bold text-emerald-400">Live Preview</span>

        <span className="mx-1 h-3 w-px bg-zinc-700" />

        {/* Viewport switcher */}
        <div className="flex items-center gap-0.5 rounded-full border border-zinc-700/50 bg-zinc-800/60 p-0.5">
          {(["desktop", "tablet", "mobile"] as const).map(vp => (
            <button key={vp} type="button" onClick={() => onViewportChange(vp)}
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold transition ${viewport === vp ? "bg-zinc-600 text-white" : "text-zinc-500 hover:text-zinc-300"}`}>
              {vp === "desktop" ? "🖥 Desktop" : vp === "tablet" ? "📱 Tablet" : "📲 Mobile"}
            </button>
          ))}
        </div>

        <span className="mx-1 h-3 w-px bg-zinc-700" />

        {/* Exit */}
        <button type="button" onClick={onClose}
          className="flex items-center gap-1 rounded-full bg-zinc-800 border border-zinc-600 px-2.5 py-0.5 text-[10px] font-semibold text-zinc-300 hover:bg-zinc-700 hover:text-white transition">
          <X size={10} /> Exit Preview
        </button>
      </div>

      {/* Preview frame — centered, natural scroll */}
      <div className="flex flex-1 flex-col overflow-auto items-center bg-[#111] pt-14">
        <div
          className="w-full flex-1"
          style={{ maxWidth: viewport === "desktop" ? "100%" : viewport === "tablet" ? "768px" : "390px" }}
        >
          <iframe
            src="/"
            className="block w-full"
            style={{
              minHeight: "100vh",
              border: "none",
              width: widths[viewport],
            }}
            title="Live preview"
            sandbox="allow-same-origin allow-scripts allow-forms"
          />
        </div>
      </div>

      {/* Bottom hint */}
      <div className="flex shrink-0 items-center justify-center border-t border-zinc-800 bg-zinc-950 py-1">
        <p className="text-[9px] text-zinc-700">Press Esc or click Exit Preview to return to the editor</p>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// INSPECTOR PANEL — right panel, Inspect tab
// ═══════════════════════════════════════════════════════════════

function InspectorPanel({
  state, dispatch, currentMode, onApplyMode,
}: {
  state: State; dispatch: React.Dispatch<Action>; currentMode: LayoutMode; onApplyMode: (m: LayoutMode) => void
}) {
  if (!state.selected) {
    const activeRows = state.config.rows.filter(r => r.enabled).length
    const newsCount  = state.config.rows.flatMap(r => r.sections).filter(s => DEFS[s.id].group === "news"    && s.enabled).length
    const adCount    = state.config.rows.flatMap(r => r.sections).filter(s => DEFS[s.id].group === "ads"     && s.enabled).length
    const unbalanced = state.config.rows.filter(r => { const t = rowEnabledSpan(r); return r.enabled && t > 0 && t !== 12 })

    return (
      <div className="flex flex-col gap-3 p-3">
        <div className="rounded-xl border border-zinc-700/40 bg-zinc-800/20 p-4 text-center">
          <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800">
            <MousePointer2 size={16} className="text-zinc-500" />
          </div>
          <p className="text-[11px] font-semibold text-zinc-300">Click any section on the homepage</p>
          <p className="mt-0.5 text-[9px] text-zinc-600">Hover to see controls · click label to select · inspect on right</p>
        </div>

        <div className="rounded-xl border border-zinc-700/40 bg-zinc-800/20 p-3">
          <p className="mb-2 text-[9px] font-bold uppercase tracking-wider text-zinc-600">Layout Overview</p>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { label: "Active",  value: activeRows,  color: "text-zinc-100" },
              { label: "News",    value: newsCount,   color: "text-blue-400" },
              { label: "Ads",     value: adCount,     color: "text-amber-400" },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-lg bg-zinc-800/60 p-2 text-center">
                <p className={`text-lg font-bold ${color}`}>{value}</p>
                <p className="text-[8px] font-semibold uppercase tracking-wide text-zinc-600">{label}</p>
              </div>
            ))}
          </div>
          {unbalanced.length > 0 && (
            <div className="mt-2 flex items-center justify-between rounded-lg border border-amber-500/20 bg-amber-500/10 px-2.5 py-2">
              <p className="flex items-center gap-1 text-[10px] font-semibold text-amber-400">
                <TriangleAlert size={9} /> {unbalanced.length} row{unbalanced.length > 1 ? "s" : ""} unbalanced
              </p>
              <button type="button"
                onClick={() => unbalanced.forEach(r => dispatch({ type: "HEAL_ROW", rowId: r.id }))}
                className="rounded bg-amber-500/20 px-2 py-0.5 text-[9px] font-bold text-amber-300 hover:bg-amber-500/30 transition">
                Fix All
              </button>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-zinc-700/40 bg-zinc-800/20 p-3">
          <p className="mb-2 text-[9px] font-bold uppercase tracking-wider text-zinc-600">Quick Presets</p>
          <div className="grid grid-cols-2 gap-1">
            {MODES.map(m => (
              <button key={m.id} type="button" onClick={() => onApplyMode(m.id)} title={m.description}
                style={currentMode === m.id ? { borderColor: m.palette, backgroundColor: m.palette + "20" } : undefined}
                className={`flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-[10px] font-semibold transition ${currentMode === m.id ? "text-white" : "border-zinc-700/50 bg-zinc-800/40 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300"}`}>
                <span>{m.icon}</span>
                <span className="truncate">{m.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-3">
      <ConfigPanel state={state} dispatch={dispatch} />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// LAYERS PANEL — right panel, Structure tab
// ═══════════════════════════════════════════════════════════════

function LayersPanel({ state, dispatch }: { state: State; dispatch: React.Dispatch<Action> }) {
  const [draggedId, setDraggedId]     = useState<string | null>(null)
  const [dragOverId, setDragOverId]   = useState<string | null>(null)
  const [resizePreview, setResizePreview] = useState<{ rowId: string; sectionId: SectionId; colSpan: ColSpan } | null>(null)

  const handleCommit = useCallback((rowId: string, sectionId: SectionId, colSpan: ColSpan) => {
    setResizePreview(null)
    dispatch({ type: "RESIZE_AND_BALANCE", rowId, sectionId, colSpan })
  }, [dispatch])

  return (
    <div className="flex flex-col gap-2 p-2" onDragEnd={() => { setDraggedId(null); setDragOverId(null) }}>
      <p className="px-1 text-[9px] font-bold uppercase tracking-wider text-zinc-600">Page Structure · drag ≡ to reorder</p>
      <div className="space-y-1">
        {state.config.rows.map(row => (
          <RowItem key={row.id} row={row} selected={state.selected}
            isDragOver={dragOverId === row.id && draggedId !== row.id}
            resizePreview={resizePreview?.rowId === row.id ? { sectionId: resizePreview.sectionId, colSpan: resizePreview.colSpan } : null}
            dispatch={dispatch}
            onDragStart={id => setDraggedId(id)}
            onDragOver={(e, id) => { e.preventDefault(); if (id !== draggedId) setDragOverId(id) }}
            onDrop={targetId => {
              if (draggedId && draggedId !== targetId) {
                const rows = [...state.config.rows]
                const fi = rows.findIndex(r => r.id === draggedId)
                const ti = rows.findIndex(r => r.id === targetId)
                const [m] = rows.splice(fi, 1)
                rows.splice(ti, 0, m)
                dispatch({ type: "REORDER", rows })
              }
              setDraggedId(null); setDragOverId(null)
            }}
            onPreview={(sectionId, colSpan) => setResizePreview({ rowId: row.id, sectionId, colSpan })}
            onCommit={handleCommit}
          />
        ))}
      </div>
      <div className="mt-1"><MiniPreview config={state.config} selected={state.selected} /></div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// MAIN BUILDER — visual-first with live preview + content placement
// ═══════════════════════════════════════════════════════════════

export function BuilderClient({ initialConfig }: { initialConfig: LayoutConfig }) {
  const [state, dispatch] = useReducer(reducer, {
    // Auto-heal on load: fixes any unbalanced rows from previously saved configs (Task 14)
    config: healConfig(initialConfig),
    mode: "balanced" as LayoutMode,
    selected: null,
    past: [],
    future: [],
    dirty: false,
  } satisfies State)

  const [saving, setSaving]             = useState(false)
  const [saveError, setSaveError]       = useState<string | null>(null)
  const [justSaved, setJustSaved]       = useState(false)
  const [zoom, setZoom]                 = useState(0.65)
  const [viewport, setViewport]         = useState<"desktop" | "tablet" | "mobile">("desktop")
  const [iframeHeight, setIframeHeight] = useState(5000)
  const [sectionRects, setSectionRects] = useState<{ id: string; rect: { x: number; y: number; width: number; height: number } }[]>([])
  const [showOutlines, setShowOutlines] = useState(true)
  const [draftStatus, setDraftStatus]   = useState<"saved" | "saving" | "pending">("saved")
  const [iframeKey, setIframeKey]       = useState(0)
  const [rightTab, setRightTab]         = useState<"inspect" | "layers">("inspect")
  const [showPreview, setShowPreview]   = useState(false)   // Live Preview modal

  const iframeRef  = useRef<HTMLIFrameElement>(null)
  const draftTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const VIEWPORT_WIDTHS = { desktop: 1280, tablet: 768, mobile: 390 } as const
  const ZOOM_LEVELS     = [0.5, 0.65, 0.75, 1.0] as const
  const ZOOM_LABELS: Record<number, string> = { 0.5: "50%", 0.65: "65%", 0.75: "75%", 1.0: "100%" }

  const viewportW = VIEWPORT_WIDTHS[viewport]
  const scaledW   = Math.round(viewportW * zoom)
  const scaledH   = Math.round(iframeHeight * zoom)

  const dispatchMode = useCallback((action: Action) => {
    if (action.type === "APPLY_MODE") {
      const modeDef = MODES.find(m => m.id === action.mode)
      if (!modeDef) return
      dispatch({ type: "APPLY_MODE", mode: action.mode, config: modeDef.apply(state.config) })
    } else {
      dispatch(action)
    }
  }, [state.config])

  const handleApplyMode = useCallback((mode: LayoutMode) => {
    if (mode === state.mode) return
    dispatchMode({ type: "APPLY_MODE", mode })
  }, [state.mode, dispatchMode])

  const saveDraft = useCallback((config: LayoutConfig) => {
    clearTimeout(draftTimer.current)
    setDraftStatus("pending")
    draftTimer.current = setTimeout(async () => {
      setDraftStatus("saving")
      try {
        await fetch("/api/preview-layout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ config }),
        })
        setDraftStatus("saved")
        setIframeKey(k => k + 1)
      } catch {
        setDraftStatus("pending")
      }
    }, 900)
  }, [])

  useEffect(() => { if (state.dirty) saveDraft(state.config) }, [state.config, state.dirty, saveDraft])
  useEffect(() => { return () => { fetch("/api/preview-layout", { method: "DELETE" }).catch(() => {}) } }, [])

  const postToIframe = useCallback((msg: object) => {
    iframeRef.current?.contentWindow?.postMessage(msg, "*")
  }, [])

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "NM_SECTION_RECTS") setSectionRects(e.data.rects)
      if (e.data?.type === "NM_DOC_HEIGHT") setIframeHeight(h => Math.max(h, e.data.height))
      // Click-to-select: clicking a section in the iframe selects it in the builder (Task 13)
      if (e.data?.type === "NM_CLICK_SECTION") {
        const rowId = e.data.id as string
        const row = state.config.rows.find(r => r.id === rowId)
        if (row) {
          const firstEnabled = row.sections.find(s => s.enabled)
          if (firstEnabled) {
            dispatch({ type: "SELECT", sel: { rowId, sectionId: firstEnabled.id } })
          }
        }
      }
    }
    window.addEventListener("message", handler)
    return () => window.removeEventListener("message", handler)
  }, [state.config.rows])

  // Only re-send outline toggle when the user toggles it (not on iframe reload — onLoad handles that)
  useEffect(() => { postToIframe({ type: "NM_SHOW_OUTLINES", show: showOutlines }) }, [showOutlines, postToIframe])
  useEffect(() => { postToIframe({ type: "NM_HIGHLIGHT", id: state.selected?.rowId ?? null }) }, [state.selected, postToIframe])

  const handlePublish = async () => {
    setSaving(true); setSaveError(null)
    const res = await saveLayoutConfigAction(state.config)
    setSaving(false)
    if (res?.error) { setSaveError(res.error) }
    else {
      dispatch({ type: "MARK_SAVED" })
      setJustSaved(true)
      setTimeout(() => setJustSaved(false), 3000)
      setIframeKey(k => k + 1)
    }
  }

  const currentMode = MODES.find(m => m.id === state.mode)

  return (
    <>
      {/* ── LIVE PREVIEW MODAL */}
      {showPreview && (
        <LivePreviewModal
          viewport={viewport}
          onViewportChange={setViewport}
          onClose={() => setShowPreview(false)}
        />
      )}

      <div className="flex h-screen flex-col overflow-hidden bg-zinc-950 text-zinc-100">

        {/* ── TOP BAR */}
        <header className="flex shrink-0 items-center gap-2 border-b border-zinc-800 bg-zinc-900/95 px-3 py-1.5 backdrop-blur">
          <a href="/admin/homepage"
            className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200 transition">
            <ChevronLeft size={12} /> Back
          </a>
          <span className="text-zinc-700">|</span>

          <div className="flex items-center gap-1.5">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-blue-600">
              <Zap size={10} className="text-white" />
            </div>
            <span className="text-[13px] font-bold text-white">Visual Editor</span>
            {currentMode && (
              <span className="rounded-full border px-2 py-0.5 text-[9px] font-bold"
                style={{ borderColor: currentMode.palette + "60", color: currentMode.palette, backgroundColor: currentMode.palette + "15" }}>
                {currentMode.icon} {currentMode.label}
              </span>
            )}
          </div>

          <div className="flex-1" />

          {/* Live Preview button */}
          <button type="button" onClick={() => setShowPreview(true)}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-700/60 bg-zinc-800/60 px-3 py-1.5 text-[11px] font-semibold text-zinc-300 hover:border-zinc-500 hover:text-white transition">
            <Maximize2 size={11} />
            Live Preview
          </button>

          <span className="mx-1 h-4 w-px bg-zinc-700" />

          <button type="button" onClick={() => dispatchMode({ type: "UNDO" })} disabled={!state.past.length} title="Undo"
            className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-20 transition">
            <RotateCcw size={13} />
          </button>
          <button type="button" onClick={() => dispatchMode({ type: "REDO" })} disabled={!state.future.length} title="Redo"
            className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-20 transition">
            <RotateCw size={13} />
          </button>

          <span className="mx-1 h-4 w-px bg-zinc-700" />

          {draftStatus === "pending" && <span className="text-[10px] text-amber-500">● Drafting…</span>}
          {draftStatus === "saving"  && <span className="text-[10px] text-blue-400">↑ Saving…</span>}
          {draftStatus === "saved" && state.dirty && <span className="text-[10px] text-zinc-600">Draft ready</span>}

          {justSaved && (
            <div className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-semibold text-emerald-400">
              <CheckCircle2 size={11} /> Published
            </div>
          )}
          {saveError && (
            <div className="flex max-w-[160px] items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] text-red-400">
              <AlertCircle size={10} className="shrink-0" />
              <span className="truncate">{saveError}</span>
            </div>
          )}

          <button type="button" onClick={handlePublish} disabled={saving}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-[12px] font-bold transition ${saving ? "cursor-not-allowed bg-zinc-800 text-zinc-600" : "bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-700"}`}>
            <Save size={12} />
            {saving ? "Publishing…" : "Publish"}
          </button>
        </header>

        {/* ── MAIN SPLIT */}
        <div className="flex min-h-0 flex-1 overflow-hidden">

          {/* ── LEFT: IFRAME CANVAS */}
          <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden border-r border-zinc-800 bg-zinc-900">
            {/* Canvas controls */}
            <div className="flex shrink-0 items-center gap-2 border-b border-zinc-800 bg-zinc-900/80 px-3 py-1.5">
              <div className="flex items-center gap-0.5 rounded-lg border border-zinc-700/60 bg-zinc-800/60 p-0.5">
                {(["desktop", "tablet", "mobile"] as const).map(vp => (
                  <button key={vp} type="button" onClick={() => setViewport(vp)}
                    className={`rounded px-2 py-0.5 text-[10px] font-semibold transition ${viewport === vp ? "bg-zinc-600 text-white" : "text-zinc-500 hover:text-zinc-300"}`}>
                    {vp === "desktop" ? `🖥 ${VIEWPORT_WIDTHS.desktop}` : vp === "tablet" ? `📱 ${VIEWPORT_WIDTHS.tablet}` : `📲 ${VIEWPORT_WIDTHS.mobile}`}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-0.5 rounded-lg border border-zinc-700/60 bg-zinc-800/60 p-0.5">
                {ZOOM_LEVELS.map(z => (
                  <button key={z} type="button" onClick={() => setZoom(z)}
                    className={`rounded px-2 py-0.5 text-[10px] font-semibold transition ${zoom === z ? "bg-zinc-600 text-white" : "text-zinc-500 hover:text-zinc-300"}`}>
                    {ZOOM_LABELS[z]}
                  </button>
                ))}
              </div>

              <button type="button" onClick={() => setShowOutlines(o => !o)}
                className={`flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold transition ${showOutlines ? "border-blue-500/30 bg-blue-600/20 text-blue-400" : "border-zinc-700/40 text-zinc-600 hover:text-zinc-300"}`}>
                <span className="text-[11px]">⬡</span>
                {showOutlines ? "Overlays ON" : "Overlays OFF"}
              </button>

              <div className="flex-1" />

              <div className="flex items-center gap-1.5 text-[9px] text-zinc-600">
                {draftStatus !== "saved" && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />}
                {draftStatus === "saved" ? "✓ Live draft" : "Updating…"}
              </div>
              <a href="/" target="_blank" rel="noopener noreferrer" className="text-[9px] text-zinc-600 hover:text-zinc-400 underline transition">
                Open full ↗
              </a>
            </div>

            {/* Scrollable canvas */}
            <div className="flex-1 overflow-auto bg-[#1a1a1a] p-6">
              {/* Container uses iframeHeight so overlays for deep sections don't fall outside bounds */}
              <div className="relative mx-auto origin-top" style={{ width: scaledW, height: iframeHeight }}>
                {/* Overlay layer */}
                {showOutlines && (
                  <div className="absolute inset-0 z-10 pointer-events-none overflow-visible">
                    {sectionRects.map(({ id, rect }) => (
                      <SectionOverlay key={id} rowId={id}
                        row={state.config.rows.find(r => r.id === id)}
                        rect={rect} zoom={zoom} selected={state.selected}
                        dispatch={dispatchMode} allRows={state.config.rows}
                      />
                    ))}
                  </div>
                )}

                {/* Iframe */}
                <iframe
                  ref={iframeRef}
                  key={iframeKey}
                  src="/"
                  onLoad={() => {
                    try {
                      const h = iframeRef.current?.contentDocument?.documentElement?.scrollHeight
                      if (h && h > 0) setIframeHeight(prev => Math.max(prev, h + 200))
                    } catch {}
                    // Send outlines/highlight after a short delay (bridge needs time to mount)
                    setTimeout(() => {
                      postToIframe({ type: "NM_SHOW_OUTLINES", show: showOutlines })
                      postToIframe({ type: "NM_HIGHLIGHT", id: state.selected?.rowId ?? null })
                    }, 400)
                    // Request fresh rects — bridge responds with NM_SECTION_RECTS
                    setTimeout(() => postToIframe({ type: "NM_REQUEST_RECTS" }), 600)
                    // Second request after Suspense boundaries likely resolved
                    setTimeout(() => postToIframe({ type: "NM_REQUEST_RECTS" }), 1800)
                  }}
                  style={{
                    width: viewportW, height: iframeHeight, border: "none", display: "block",
                    transform: `scale(${zoom})`, transformOrigin: "top left",
                  }}
                  title="Homepage preview"
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                />
              </div>
            </div>
          </div>

          {/* ── RIGHT: INSPECTOR / LAYERS */}
          <div className="flex w-[300px] shrink-0 flex-col overflow-hidden bg-zinc-900">
            {/* Tab bar */}
            <div className="flex shrink-0 items-center gap-0 border-b border-zinc-800 px-2 pt-1">
              {([
                { id: "inspect", icon: <SlidersHorizontal size={11} />, label: "Inspect" },
                { id: "layers",  icon: <Layers size={11} />,            label: "Structure" },
              ] as const).map(tab => (
                <button key={tab.id} type="button" onClick={() => setRightTab(tab.id)}
                  className={`flex items-center gap-1.5 rounded-t-md px-3 py-1.5 text-[11px] font-semibold transition-colors ${rightTab === tab.id ? "border-b-2 border-blue-500 bg-zinc-800/60 text-white" : "text-zinc-500 hover:text-zinc-300"}`}>
                  {tab.icon}{tab.label}
                </button>
              ))}

              {state.selected && (
                <div className="ml-auto flex items-center gap-1 rounded-full border border-blue-500/25 bg-blue-600/15 px-2 py-0.5">
                  <span className="text-[9px] font-semibold text-blue-400">
                    {DEFS[state.selected.sectionId].icon} {DEFS[state.selected.sectionId].label}
                  </span>
                  <button type="button" onClick={() => dispatch({ type: "SELECT", sel: null })}
                    className="text-blue-500/60 hover:text-blue-300 transition">
                    <X size={9} />
                  </button>
                </div>
              )}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto">
              {rightTab === "inspect"
                ? <InspectorPanel state={state} dispatch={dispatchMode} currentMode={state.mode} onApplyMode={handleApplyMode} />
                : <LayersPanel state={state} dispatch={dispatchMode} />
              }
            </div>

            {/* Status bar */}
            <div className="flex shrink-0 items-center justify-between border-t border-zinc-800 bg-zinc-900 px-3 py-1.5">
              <p className="text-[9px]">
                {state.dirty
                  ? <span className="text-amber-500">● Unsaved changes</span>
                  : <span className="text-emerald-600">✓ Published</span>
                }
              </p>
              <p className="text-[9px] text-zinc-700">
                {state.past.length > 0 ? `${state.past.length} undo steps` : ""}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
