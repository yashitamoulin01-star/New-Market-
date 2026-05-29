"use client"

import { useReducer, useState, useCallback, useRef, useEffect } from "react"
import {
  GripVertical, Eye, EyeOff, RotateCcw, RotateCw, Save,
  CheckCircle2, AlertCircle, X, Zap, ChevronLeft, Wand2,
  TriangleAlert, Wrench,
} from "lucide-react"
import type {
  LayoutConfig, LayoutRow, SectionBlock, SectionId, ColSpan, SectionSize,
} from "@/lib/supabase/layout-config"
import { saveLayoutConfigAction } from "./actions"

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

const SPAN_OPTS: { value: ColSpan; label: string }[] = [
  { value: 3,  label: "¼" },
  { value: 4,  label: "⅓" },
  { value: 6,  label: "½" },
  { value: 8,  label: "⅔" },
  { value: 9,  label: "¾" },
  { value: 12, label: "Full" },
]

// ═══════════════════════════════════════════════════════════════
// ① GRID ALGORITHMS — spatial intelligence engine
// ═══════════════════════════════════════════════════════════════

const VALID_SPANS: ColSpan[] = [3, 4, 6, 8, 9, 12]

function snapToSpan(n: number): ColSpan {
  const clamped = Math.max(3, Math.min(12, n))
  return VALID_SPANS.reduce((best, s) =>
    Math.abs(s - clamped) < Math.abs(best - clamped) ? s : best
  )
}

function rowEnabledSpan(row: LayoutRow): number {
  return row.sections.filter(s => s.enabled).reduce((sum, s) => sum + s.colSpan, 0)
}

/** Layout healing — redistribute 12 cols proportionally among enabled sections */
function healRow(row: LayoutRow): LayoutRow {
  const enabled = row.sections.filter(s => s.enabled)
  if (enabled.length === 0) return row

  // Single section → full width
  if (enabled.length === 1) {
    return { ...row, sections: row.sections.map(s => s.enabled ? { ...s, colSpan: 12 } : s) }
  }

  const currentTotal = enabled.reduce((sum, s) => sum + s.colSpan, 0)
  const newSpans = new Map<SectionId, ColSpan>()
  let remaining = 12

  // Distribute proportionally, leave last section to absorb rounding
  enabled.slice(0, -1).forEach(s => {
    const raw = (s.colSpan / currentTotal) * 12
    const minGuarantee = 3 * (enabled.length - newSpans.size - 1) // keep min 3 for others
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

/** Spatial auto-balance — resize one section, siblings adjust proportionally */
function balanceRow(row: LayoutRow, changedId: SectionId, newSpan: ColSpan): LayoutRow {
  const enabled = row.sections.filter(s => s.enabled)
  const siblings = enabled.filter(s => s.id !== changedId)

  if (siblings.length === 0) {
    // Only section → just set span (cap at 12)
    return { ...row, sections: row.sections.map(s => s.id === changedId ? { ...s, colSpan: snapToSpan(newSpan) } : s) }
  }

  // Ensure enough space for all siblings (min 3 each)
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
// ② LAYOUT MODES — intelligent preset transformations
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
  {
    id: "balanced",
    label: "Balanced",
    icon: "⚖️",
    description: "Default newsroom — balanced content and ads",
    palette: "#3b82f6",
    apply: c => c,
  },
  {
    id: "photo_heavy",
    label: "Photo Magazine",
    icon: "🖼",
    description: "Large images, spacious cards, visual storytelling",
    palette: "#8b5cf6",
    apply: c => healConfig(patch(c, {
      hero:         { enabled: true, colSpan: 8, size: "large", variant: "photo" },
      latest_panel: { enabled: true, colSpan: 4, size: "normal" },
      mini_grid:    { enabled: true, colSpan: 12, size: "large" },
      trending:     { enabled: true, colSpan: 9, size: "large" },
      text_stories: { enabled: false },
    })),
  },
  {
    id: "text_heavy",
    label: "Text Newsroom",
    icon: "📰",
    description: "Dense headlines, compact cards, maximum information",
    palette: "#64748b",
    apply: c => healConfig(patch(c, {
      hero:         { enabled: true, colSpan: 6, size: "compact", variant: "text-split" },
      latest_panel: { enabled: true, colSpan: 6, size: "compact" },
      mini_grid:    { enabled: true, colSpan: 8, size: "compact" },
      text_stories: { enabled: true, colSpan: 4, size: "compact" },
      trending:     { enabled: false },
    })),
  },
  {
    id: "breaking_news",
    label: "Breaking News",
    icon: "⚡",
    description: "Urgent, hero-dominant, ticker prominent, maximum impact",
    palette: "#dc2626",
    apply: c => healConfig(patch(c, {
      ticker:       { enabled: true },
      hero:         { enabled: true, colSpan: 12, size: "large", variant: "photo" },
      mini_grid:    { enabled: false },
      trending:     { enabled: false },
      text_stories: { enabled: true, colSpan: 8, size: "compact" },
      latest_panel: { enabled: true, colSpan: 4, size: "compact" },
      top_ad:       { enabled: false },
      mid_ad:       { enabled: false },
      bottom_ad:    { enabled: false },
      youtube:      { enabled: false },
      jobs_panel:   { enabled: false },
    })),
  },
  {
    id: "minimal",
    label: "Minimal Clean",
    icon: "✦",
    description: "No ads, spacious premium layout, pure content focus",
    palette: "#0ea5e9",
    apply: c => healConfig(patch(c, {
      top_ad:        { enabled: false },
      mid_ad:        { enabled: false },
      bottom_ad:     { enabled: false },
      hero:          { enabled: true, colSpan: 8, size: "large", variant: "photo" },
      latest_panel:  { enabled: true, colSpan: 4, size: "normal" },
      community_strip: { enabled: true },
    })),
  },
  {
    id: "ads_heavy",
    label: "Ad Optimised",
    icon: "📢",
    description: "All ad slots active, content balanced around ads",
    palette: "#d97706",
    apply: c => healConfig(patch(c, {
      top_ad:       { enabled: true, colSpan: 12, size: "normal" },
      mid_ad:       { enabled: true, colSpan: 12, size: "normal" },
      bottom_ad:    { enabled: true, colSpan: 12, size: "normal" },
      hero:         { enabled: true, colSpan: 8, size: "compact" },
      latest_panel: { enabled: true, colSpan: 4, size: "compact" },
      mini_grid:    { enabled: true, size: "compact" },
    })),
  },
  {
    id: "election",
    label: "Election Mode",
    icon: "🗳",
    description: "Elections widget prominent, voting and civic focus",
    palette: "#7c3aed",
    apply: c => healConfig(patch(c, {
      elections:    { enabled: true, colSpan: 4, size: "large" },
      hero:         { enabled: true, colSpan: 8, size: "large" },
      latest_panel: { enabled: true, colSpan: 4, size: "normal" },
      section_links: { enabled: true },
    })),
  },
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
        return healRow(toggled) // auto-heal siblings
      })
      return { ...s, config: { ...s.config, rows }, past: push(s.past, s.config), future: [], dirty: true }
    }

    case "RESIZE_AND_BALANCE": {
      const rows = s.config.rows.map(r =>
        r.id !== a.rowId ? r : balanceRow(r, a.sectionId, a.colSpan)
      )
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
// ③ RESIZE HANDLE — drag right edge to resize with snapping
// ═══════════════════════════════════════════════════════════════

function ResizeHandle({
  currentSpan,
  rowId,
  sectionId,
  rowRef,
  onPreview,
  onCommit,
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
    e.preventDefault()
    e.stopPropagation()

    const container = rowRef.current
    if (!container) return

    const containerWidth = container.offsetWidth
    const colWidth = containerWidth / 12
    const startX = e.clientX
    const startSpan = spanRef.current
    let lastSnapped = startSpan

    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX
      const raw = startSpan + dx / colWidth
      const snapped = snapToSpan(raw)
      if (snapped !== lastSnapped) {
        lastSnapped = snapped
        onPreview(snapped)
      }
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
      <div className="h-6 w-[3px] rounded-full bg-white/20 transition-all group-hover/rh:h-full group-hover/rh:w-[3px] group-hover/rh:bg-white/70" />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// SECTION CELL
// ═══════════════════════════════════════════════════════════════

function SectionCell({
  block, rowId, selected, displaySpan, rowRef, dispatch, onPreview, onCommit,
}: {
  block: SectionBlock
  rowId: string
  selected: boolean
  displaySpan: ColSpan
  rowRef: React.RefObject<HTMLDivElement | null>
  dispatch: React.Dispatch<Action>
  onPreview: (span: ColSpan) => void
  onCommit: (rowId: string, sectionId: SectionId, span: ColSpan) => void
}) {
  const def = DEFS[block.id]
  const pct = (displaySpan / 12) * 100

  return (
    <div
      className="relative flex min-w-0 items-stretch transition-all duration-150"
      style={{ width: `${pct}%` }}
    >
      <button
        type="button"
        onClick={() => dispatch({ type: "SELECT", sel: selected ? null : { rowId, sectionId: block.id } })}
        title={`${def.label} · ${displaySpan}/12 columns`}
        style={{
          backgroundColor: block.enabled ? def.color + "cc" : "#27272a",
          boxShadow: selected ? `0 0 0 2px #93c5fd, 0 0 0 4px #1e3a5f` : undefined,
        }}
        className={`
          flex flex-1 items-center gap-1.5 overflow-hidden rounded px-2.5 py-0 transition-all min-h-[52px]
          ${block.enabled ? "text-white hover:brightness-125" : "text-zinc-500 hover:bg-zinc-700"}
          ${selected ? "ring-2 ring-blue-300" : ""}
        `}
      >
        <span className="shrink-0 text-sm leading-none">{def.icon}</span>
        <div className="min-w-0 flex-1 text-left">
          <p className="truncate text-[10px] font-bold leading-tight">{def.label}</p>
          <p className="text-[8px] opacity-60">{displaySpan}/12</p>
        </div>
        {!block.enabled && <span className="ml-auto shrink-0 rounded bg-zinc-800 px-1 text-[8px] text-zinc-500">OFF</span>}
      </button>

      {/* ③ Drag resize handle */}
      {block.enabled && (
        <ResizeHandle
          currentSpan={displaySpan}
          rowId={rowId}
          sectionId={block.id}
          rowRef={rowRef}
          onPreview={onPreview}
          onCommit={onCommit}
        />
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// ④ ROW BALANCE VALIDATOR
// ═══════════════════════════════════════════════════════════════

function BalanceChip({ row, dispatch }: { row: LayoutRow; dispatch: React.Dispatch<Action> }) {
  const enabled = row.sections.filter(s => s.enabled)
  if (enabled.length === 0) return null

  const total = enabled.reduce((sum, s) => sum + s.colSpan, 0)
  const balanced = total === 12

  if (balanced) {
    return <span className="shrink-0 text-[8px] text-emerald-500 opacity-50">✓12</span>
  }

  return (
    <button
      type="button"
      onClick={() => dispatch({ type: "HEAL_ROW", rowId: row.id })}
      title={`Row uses ${total}/12 cols — click to auto-fix`}
      className="flex shrink-0 items-center gap-1 rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-400 hover:bg-amber-500/30 transition"
    >
      <TriangleAlert size={9} />
      {total}/12
      <Wrench size={9} />
    </button>
  )
}

// ═══════════════════════════════════════════════════════════════
// ROW ITEM
// ═══════════════════════════════════════════════════════════════

function RowItem({
  row, selected, isDragOver, resizePreview, dispatch,
  onDragStart, onDragOver, onDrop, onPreview, onCommit,
}: {
  row: LayoutRow
  selected: Selection
  isDragOver: boolean
  resizePreview: { sectionId: SectionId; colSpan: ColSpan } | null
  dispatch: React.Dispatch<Action>
  onDragStart: (id: string) => void
  onDragOver: (e: React.DragEvent, id: string) => void
  onDrop: (id: string) => void
  onPreview: (sectionId: SectionId, colSpan: ColSpan) => void
  onCommit: (rowId: string, sectionId: SectionId, colSpan: ColSpan) => void
}) {
  const rowRef = useRef<HTMLDivElement>(null)

  // Apply resize preview locally (no history) using balanceRow
  const displayRow = resizePreview
    ? balanceRow(row, resizePreview.sectionId, resizePreview.colSpan)
    : row

  return (
    <div
      draggable
      onDragStart={() => onDragStart(row.id)}
      onDragOver={(e) => onDragOver(e, row.id)}
      onDrop={(e) => { e.preventDefault(); onDrop(row.id) }}
      className={`
        group flex items-center gap-2 rounded-xl border p-2 transition-all duration-150
        cursor-grab active:cursor-grabbing select-none
        ${row.enabled ? "border-zinc-700 bg-zinc-800/80" : "border-zinc-700/30 bg-zinc-800/20 opacity-40"}
        ${isDragOver ? "border-blue-400 bg-blue-900/30 scale-[1.01]" : "hover:border-zinc-600"}
      `}
    >
      {/* Grip */}
      <div className="shrink-0 cursor-grab text-zinc-600 transition group-hover:text-zinc-400">
        <GripVertical size={14} />
      </div>

      {/* Section cells */}
      <div ref={rowRef} className="flex min-w-0 flex-1 gap-1">
        {displayRow.sections.map((block) => (
          <SectionCell
            key={block.id}
            block={block}
            rowId={row.id}
            displaySpan={block.colSpan}
            selected={selected?.rowId === row.id && selected?.sectionId === block.id}
            rowRef={rowRef}
            dispatch={dispatch}
            onPreview={(span) => onPreview(block.id, span)}
            onCommit={onCommit}
          />
        ))}
      </div>

      {/* Balance chip */}
      <BalanceChip row={displayRow} dispatch={dispatch} />

      {/* Row toggle */}
      <button
        type="button"
        onClick={() => dispatch({ type: "TOGGLE_ROW", rowId: row.id })}
        className="shrink-0 rounded p-1.5 text-zinc-600 transition hover:bg-zinc-700 hover:text-zinc-300"
        title={row.enabled ? "Hide row" : "Show row"}
      >
        {row.enabled ? <Eye size={13} /> : <EyeOff size={13} />}
      </button>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// ② MODE SELECTOR
// ═══════════════════════════════════════════════════════════════

function ModeSelector({ current, dispatch }: { current: LayoutMode; dispatch: React.Dispatch<Action> }) {
  return (
    <div className="flex flex-wrap gap-1.5 border-b border-zinc-800 bg-zinc-900/60 px-4 py-2">
      <span className="self-center text-[9px] font-bold uppercase tracking-wider text-zinc-600 mr-1">Mode:</span>
      {MODES.map(m => (
        <button
          key={m.id}
          type="button"
          onClick={() => {
            if (m.id === current) return
            dispatch({ type: "APPLY_MODE", mode: m.id })
          }}
          title={m.description}
          className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold transition
            ${current === m.id
              ? "border-zinc-500 bg-zinc-700 text-white"
              : "border-zinc-700 bg-zinc-800/60 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
            }
          `}
        >
          <span>{m.icon}</span>
          <span>{m.label}</span>
        </button>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// CONFIG PANEL
// ═══════════════════════════════════════════════════════════════

function ConfigPanel({ state, dispatch }: { state: State; dispatch: React.Dispatch<Action> }) {
  const { selected, config } = state

  if (!selected) {
    // Show layout health summary
    const rows = config.rows.filter(r => r.enabled)
    const unbalanced = rows.filter(r => {
      const total = rowEnabledSpan(r)
      return total > 0 && total !== 12
    })
    const adRows = config.rows.flatMap(r => r.sections).filter(s => DEFS[s.id].group === "ads" && s.enabled).length
    const newsRows = config.rows.flatMap(r => r.sections).filter(s => DEFS[s.id].group === "news" && s.enabled).length

    return (
      <div className="space-y-3">
        <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-3 text-center">
          <Wand2 size={18} className="mx-auto mb-1.5 text-zinc-600" />
          <p className="text-xs font-semibold text-zinc-400">Click a block to configure it</p>
          <p className="mt-0.5 text-[10px] text-zinc-600">Drag the right edge to resize · Drag ≡ to reorder</p>
        </div>

        {/* Layout health */}
        <div className="rounded-lg border border-zinc-700 bg-zinc-800/40 p-3">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Layout Health</p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">Active rows</span>
              <span className="font-bold text-zinc-200">{rows.length}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">News sections</span>
              <span className="font-bold text-blue-400">{newsRows}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">Ad slots active</span>
              <span className="font-bold text-amber-400">{adRows}</span>
            </div>
            {unbalanced.length > 0 && (
              <div className="mt-2 rounded bg-amber-500/10 px-2 py-1.5">
                <p className="text-[10px] font-semibold text-amber-400">
                  ⚠ {unbalanced.length} row{unbalanced.length > 1 ? "s" : ""} need balancing
                </p>
                <button
                  type="button"
                  onClick={() => unbalanced.forEach(r => dispatch({ type: "HEAL_ROW", rowId: r.id }))}
                  className="mt-1 rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 hover:bg-amber-500/30 transition"
                >
                  Fix All Rows →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mini preview */}
        <MiniPreview config={config} selected={null} />
      </div>
    )
  }

  const row = config.rows.find(r => r.id === selected.rowId)
  const block = row?.sections.find(s => s.id === selected.sectionId)
  if (!row || !block) return null
  const def = DEFS[block.id]
  const otherActive = row.sections.filter(s => s.id !== block.id && s.enabled).reduce((sum, s) => sum + s.colSpan, 0)

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-3 rounded-lg p-3" style={{ backgroundColor: def.color + "18", border: `1px solid ${def.color}40` }}>
        <span className="text-lg">{def.icon}</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-white">{def.label}</p>
          <p className="text-[10px] text-zinc-400">{def.description}</p>
        </div>
        <button type="button" onClick={() => dispatch({ type: "SELECT", sel: null })} className="shrink-0 text-zinc-500 hover:text-zinc-300">
          <X size={13} />
        </button>
      </div>

      {/* Visible */}
      <div className="flex items-center justify-between rounded-lg border border-zinc-700 px-3 py-2.5">
        <div>
          <p className="text-xs font-semibold text-zinc-200">Visible</p>
          <p className="text-[10px] text-zinc-500">{block.enabled ? "Showing on homepage" : "Hidden"}</p>
        </div>
        <button
          type="button"
          onClick={() => dispatch({ type: "TOGGLE_SECTION", rowId: selected.rowId, sectionId: selected.sectionId })}
          className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${block.enabled ? "bg-blue-600" : "bg-zinc-700"}`}
        >
          <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${block.enabled ? "translate-x-4" : "translate-x-0.5"}`} />
        </button>
      </div>

      {/* Width */}
      <div className="rounded-lg border border-zinc-700 p-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold text-zinc-200">Column Width</p>
          <span className="text-[10px] text-zinc-500">{block.colSpan}/12 · {Math.round((block.colSpan / 12) * 100)}%</span>
        </div>
        <div className="mb-2.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-700">
          <div className="h-full rounded-full transition-all" style={{ width: `${(block.colSpan / 12) * 100}%`, backgroundColor: def.color }} />
        </div>
        <div className="grid grid-cols-3 gap-1">
          {SPAN_OPTS.map(o => {
            const fits = otherActive + o.value <= 12
            const active = block.colSpan === o.value
            return (
              <button
                key={o.value}
                type="button"
                disabled={!fits}
                onClick={() => dispatch({ type: "RESIZE_AND_BALANCE", rowId: selected.rowId, sectionId: selected.sectionId, colSpan: o.value })}
                className={`rounded py-2 text-[11px] font-bold transition
                  ${active ? "text-white" : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"}
                  ${!fits ? "cursor-not-allowed opacity-20" : ""}
                `}
                style={active ? { backgroundColor: def.color } : undefined}
              >
                {o.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Size */}
      <div className="rounded-lg border border-zinc-700 p-3">
        <p className="mb-2 text-xs font-semibold text-zinc-200">Content Density</p>
        <div className="grid grid-cols-3 gap-1">
          {(["compact", "normal", "large"] as SectionSize[]).map(sz => (
            <button
              key={sz}
              type="button"
              onClick={() => dispatch({ type: "SET_SIZE", rowId: selected.rowId, sectionId: selected.sectionId, size: sz })}
              className={`rounded py-2 text-[11px] font-semibold capitalize transition ${block.size === sz ? "text-white" : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"}`}
              style={block.size === sz ? { backgroundColor: def.color } : undefined}
            >
              {sz}
            </button>
          ))}
        </div>
      </div>

      {/* Variant */}
      {def.variants && (
        <div className="rounded-lg border border-zinc-700 p-3">
          <p className="mb-2 text-xs font-semibold text-zinc-200">Display Style</p>
          <div className="space-y-1.5">
            {def.variants.map(v => {
              const active = (block.variant ?? def.variants![0].value) === v.value
              return (
                <button
                  key={v.value}
                  type="button"
                  onClick={() => dispatch({ type: "SET_VARIANT", rowId: selected.rowId, sectionId: selected.sectionId, variant: v.value })}
                  className={`flex w-full items-center gap-2 rounded px-3 py-2 text-left text-[11px] font-semibold transition ${active ? "text-white" : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"}`}
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

      <MiniPreview config={config} selected={selected} />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// MINI PREVIEW
// ═══════════════════════════════════════════════════════════════

function MiniPreview({ config, selected }: { config: LayoutConfig; selected: Selection }) {
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-700 bg-zinc-950">
      <div className="border-b border-zinc-700 px-3 py-1.5">
        <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-600">Page Schematic</p>
      </div>
      <div className="space-y-[2px] p-2">
        {config.rows.map(row => {
          const vis = row.enabled ? row.sections.filter(s => s.enabled) : []
          return (
            <div key={row.id} className="flex gap-[2px]">
              {!row.enabled ? (
                <div className="h-2.5 w-full rounded-[2px] bg-zinc-800/40" />
              ) : vis.length === 0 ? null : (
                vis.map(b => {
                  const def = DEFS[b.id]
                  const isSel = selected?.rowId === row.id && selected?.sectionId === b.id
                  return (
                    <div
                      key={b.id}
                      style={{ width: `${(b.colSpan / 12) * 100}%`, backgroundColor: def.color }}
                      className={`h-2.5 rounded-[2px] transition-all ${isSel ? "brightness-150 ring-1 ring-white/60" : "opacity-70"}`}
                      title={`${def.label} · ${b.colSpan}/12`}
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

// ═══════════════════════════════════════════════════════════════
// MAIN BUILDER
// ═══════════════════════════════════════════════════════════════

export function BuilderClient({ initialConfig }: { initialConfig: LayoutConfig }) {
  const [state, dispatch] = useReducer(reducer, {
    config: initialConfig,
    mode: "balanced" as LayoutMode,
    selected: null,
    past: [],
    future: [],
    dirty: false,
  } satisfies State)

  const [draggedId, setDraggedId]     = useState<string | null>(null)
  const [dragOverId, setDragOverId]   = useState<string | null>(null)
  const [saving, setSaving]           = useState(false)
  const [saveError, setSaveError]     = useState<string | null>(null)
  const [justSaved, setJustSaved]     = useState(false)
  const [resizePreview, setResizePreview] = useState<{ rowId: string; sectionId: SectionId; colSpan: ColSpan } | null>(null)

  // Preview state
  const [zoom, setZoom]               = useState(0.65)
  const [viewport, setViewport]       = useState<"desktop" | "tablet" | "mobile">("desktop")
  const [iframeHeight, setIframeHeight] = useState(5000)
  const [sectionRects, setSectionRects] = useState<{ id: string; rect: { x: number; y: number; width: number; height: number } }[]>([])
  const [showOutlines, setShowOutlines] = useState(true)
  const [draftStatus, setDraftStatus] = useState<"saved" | "saving" | "pending">("saved")
  const [iframeKey, setIframeKey]     = useState(0)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const draftTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const previewContainerRef = useRef<HTMLDivElement>(null)

  const VIEWPORT_WIDTHS = { desktop: 1280, tablet: 768, mobile: 390 } as const
  const ZOOM_LEVELS = [0.5, 0.65, 0.75, 1.0] as const
  const ZOOM_LABELS: Record<number, string> = { 0.5: "50%", 0.65: "65%", 0.75: "75%", 1.0: "100%" }

  const viewportW = VIEWPORT_WIDTHS[viewport]
  const scaledW   = Math.round(viewportW * zoom)
  const scaledH   = Math.round(iframeHeight * zoom)

  // ── Dispatch wrappers ─────────────────────────────────────────

  const dispatchMode = useCallback((action: Action) => {
    if (action.type === "APPLY_MODE") {
      const modeDef = MODES.find(m => m.id === action.mode)
      if (!modeDef) return
      dispatch({ type: "APPLY_MODE", mode: action.mode, config: modeDef.apply(state.config) })
    } else {
      dispatch(action)
    }
  }, [state.config])

  // ── Draft save (debounced) ────────────────────────────────────

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
        // Reload iframe to reflect new draft
        setIframeKey(k => k + 1)
      } catch {
        setDraftStatus("pending")
      }
    }, 900)
  }, [])

  useEffect(() => {
    if (state.dirty) saveDraft(state.config)
  }, [state.config, state.dirty, saveDraft])

  // Clear preview cookie on unmount
  useEffect(() => {
    return () => {
      fetch("/api/preview-layout", { method: "DELETE" }).catch(() => {})
    }
  }, [])

  // ── PostMessage handler ───────────────────────────────────────

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "NM_SECTION_RECTS") setSectionRects(e.data.rects)
      if (e.data?.type === "NM_DOC_HEIGHT") setIframeHeight(h => Math.max(h, e.data.height))
    }
    window.addEventListener("message", handler)
    return () => window.removeEventListener("message", handler)
  }, [])

  const postToIframe = useCallback((msg: object) => {
    iframeRef.current?.contentWindow?.postMessage(msg, "*")
  }, [])

  // Sync outline visibility
  useEffect(() => {
    postToIframe({ type: "NM_SHOW_OUTLINES", show: showOutlines })
  }, [showOutlines, iframeKey, postToIframe])

  // Highlight selected section
  useEffect(() => {
    postToIframe({ type: "NM_HIGHLIGHT", id: state.selected?.rowId ?? null })
  }, [state.selected, postToIframe])

  // ── Drag/drop ────────────────────────────────────────────────

  const handleDragStart = useCallback((id: string) => setDraggedId(id), [])
  const handleDragOver  = useCallback((e: React.DragEvent, id: string) => { e.preventDefault(); if (id !== draggedId) setDragOverId(id) }, [draggedId])
  const handleDrop      = useCallback((targetId: string) => {
    if (draggedId && draggedId !== targetId) {
      const rows = [...state.config.rows]
      const fi = rows.findIndex(r => r.id === draggedId)
      const ti = rows.findIndex(r => r.id === targetId)
      const [m] = rows.splice(fi, 1)
      rows.splice(ti, 0, m)
      dispatch({ type: "REORDER", rows })
    }
    setDraggedId(null); setDragOverId(null)
  }, [draggedId, state.config.rows])

  const handleCommit    = useCallback((rowId: string, sectionId: SectionId, colSpan: ColSpan) => {
    setResizePreview(null)
    dispatch({ type: "RESIZE_AND_BALANCE", rowId, sectionId, colSpan })
  }, [])

  // ── Publish ──────────────────────────────────────────────────

  const handlePublish = async () => {
    setSaving(true); setSaveError(null)
    const res = await saveLayoutConfigAction(state.config)
    setSaving(false)
    if (res?.error) { setSaveError(res.error) }
    else {
      dispatch({ type: "MARK_SAVED" })
      setJustSaved(true)
      setTimeout(() => setJustSaved(false), 3000)
      setIframeKey(k => k + 1) // reload after publish
    }
  }

  const activeRows   = state.config.rows.filter(r => r.enabled).length
  const unbalanced   = state.config.rows.filter(r => { const t = rowEnabledSpan(r); return r.enabled && t > 0 && t !== 12 }).length
  const currentMode  = MODES.find(m => m.id === state.mode)

  // ── RENDER ────────────────────────────────────────────────────

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-950 text-zinc-100" onDragEnd={() => { setDraggedId(null); setDragOverId(null) }}>

      {/* ── TOP BAR */}
      <header className="flex shrink-0 items-center gap-2 border-b border-zinc-800 bg-zinc-900 px-3 py-1.5">
        <a href="/admin/homepage" className="flex items-center gap-1 rounded px-2 py-1 text-[11px] text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200 transition">
          <ChevronLeft size={12} /> Controls
        </a>
        <span className="text-zinc-700">|</span>
        <div className="flex items-center gap-1.5">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-blue-600"><Zap size={10} className="text-white" /></div>
          <span className="text-[13px] font-bold">Visual Builder</span>
          {currentMode && <span className="rounded-full border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[9px] font-bold text-zinc-400">{currentMode.icon} {currentMode.label}</span>}
        </div>

        {/* Viewport */}
        <div className="ml-2 flex items-center gap-0.5 rounded-lg border border-zinc-700 bg-zinc-800/60 p-0.5">
          {(["desktop", "tablet", "mobile"] as const).map(vp => (
            <button key={vp} type="button" onClick={() => setViewport(vp)}
              className={`rounded px-2 py-0.5 text-[10px] font-semibold transition ${viewport === vp ? "bg-zinc-600 text-white" : "text-zinc-500 hover:text-zinc-300"}`}>
              {vp === "desktop" ? `🖥 ${VIEWPORT_WIDTHS.desktop}` : vp === "tablet" ? `📱 ${VIEWPORT_WIDTHS.tablet}` : `📲 ${VIEWPORT_WIDTHS.mobile}`}
            </button>
          ))}
        </div>

        {/* Zoom */}
        <div className="flex items-center gap-0.5 rounded-lg border border-zinc-700 bg-zinc-800/60 p-0.5">
          {ZOOM_LEVELS.map(z => (
            <button key={z} type="button" onClick={() => setZoom(z)}
              className={`rounded px-2 py-0.5 text-[10px] font-semibold transition ${zoom === z ? "bg-zinc-600 text-white" : "text-zinc-500 hover:text-zinc-300"}`}>
              {ZOOM_LABELS[z]}
            </button>
          ))}
        </div>

        {/* Outline toggle */}
        <button type="button" onClick={() => setShowOutlines(o => !o)}
          title="Toggle section outlines"
          className={`rounded px-2 py-0.5 text-[10px] font-semibold transition ${showOutlines ? "bg-blue-600/20 text-blue-400" : "text-zinc-600 hover:text-zinc-300"}`}>
          {showOutlines ? "⬡ Outlines" : "⬡ Off"}
        </button>

        <div className="flex-1" />

        {/* Undo/Redo */}
        <button type="button" onClick={() => dispatchMode({ type: "UNDO" })} disabled={!state.past.length} title="Undo" className="rounded p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-20 transition"><RotateCcw size={13} /></button>
        <button type="button" onClick={() => dispatchMode({ type: "REDO" })} disabled={!state.future.length} title="Redo" className="rounded p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-20 transition"><RotateCw size={13} /></button>

        <div className="mx-1 h-4 w-px bg-zinc-700" />

        {/* Draft status */}
        {draftStatus === "pending" && <span className="text-[10px] text-amber-500">● Drafting…</span>}
        {draftStatus === "saving"  && <span className="text-[10px] text-blue-400">↑ Saving…</span>}
        {draftStatus === "saved"   && state.dirty && <span className="text-[10px] text-zinc-500">Draft saved</span>}

        {justSaved && (
          <div className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-semibold text-emerald-400">
            <CheckCircle2 size={11} /> Published
          </div>
        )}
        {saveError && (
          <div className="flex max-w-[160px] items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] text-red-400">
            <AlertCircle size={10} className="shrink-0" /><span className="truncate">{saveError}</span>
          </div>
        )}

        <button type="button" onClick={handlePublish} disabled={saving}
          className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-[12px] font-bold transition ${!saving ? "bg-blue-600 text-white hover:bg-blue-500" : "cursor-not-allowed bg-zinc-800 text-zinc-600"}`}>
          <Save size={12} />{saving ? "Publishing…" : "Publish"}
        </button>
      </header>

      {/* ── MODE BAR */}
      <ModeSelector current={state.mode} dispatch={dispatchMode} />

      {/* ── MAIN SPLIT */}
      <div className="flex min-h-0 flex-1 overflow-hidden">

        {/* ── LEFT: SCALED PREVIEW ─────────────────────────── */}
        <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden border-r border-zinc-800 bg-zinc-900">
          {/* Preview header */}
          <div className="flex shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-900/80 px-4 py-1">
            <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-600">
              Preview · {viewport} {viewportW}px · {ZOOM_LABELS[zoom]} · {draftStatus === "saved" ? "✓ Live draft" : "Updating…"}
            </p>
            <div className="flex items-center gap-2">
              {draftStatus !== "saved" && (
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
              )}
              <a href="/" target="_blank" rel="noopener noreferrer"
                className="text-[9px] text-zinc-600 hover:text-zinc-400 transition underline">
                Open full size ↗
              </a>
            </div>
          </div>

          {/* Scrollable canvas */}
          <div className="flex-1 overflow-auto bg-zinc-800/50 p-4">
            <div
              ref={previewContainerRef}
              className="relative mx-auto origin-top"
              style={{ width: scaledW, height: scaledH }}
            >
              {/* Section overlay — clickable handles */}
              <div className="absolute inset-0 z-10 pointer-events-none" aria-hidden>
                {sectionRects.map(({ id, rect }) => {
                  const isSelected = state.selected?.rowId === id
                  return (
                    <div
                      key={id}
                      style={{
                        position: "absolute",
                        left:   Math.round(rect.x     * zoom),
                        top:    Math.round(rect.y     * zoom),
                        width:  Math.round(rect.width * zoom),
                        height: Math.round(rect.height * zoom),
                        border: isSelected
                          ? "2px solid rgba(239,68,68,0.8)"
                          : "1px dashed rgba(59,130,246,0.3)",
                        background: isSelected ? "rgba(239,68,68,0.04)" : "transparent",
                        cursor: "pointer",
                        pointerEvents: "auto",
                        borderRadius: 2,
                      }}
                      onClick={() => {
                        const row = state.config.rows.find(r => r.id === id)
                        const firstSection = row?.sections.find(s => s.enabled)
                        if (row && firstSection) {
                          dispatch({ type: "SELECT", sel: { rowId: row.id, sectionId: firstSection.id } })
                          postToIframe({ type: "NM_SCROLL_TO", id })
                        }
                      }}
                      title={id}
                    />
                  )
                })}
              </div>

              {/* Actual iframe */}
              <iframe
                ref={iframeRef}
                key={iframeKey}
                src="/"
                onLoad={() => {
                  try {
                    const h = iframeRef.current?.contentDocument?.documentElement?.scrollHeight
                    if (h && h > 0) setIframeHeight(h + 200)
                  } catch {}
                  // Re-send outline state after reload
                  setTimeout(() => {
                    postToIframe({ type: "NM_SHOW_OUTLINES", show: showOutlines })
                    postToIframe({ type: "NM_HIGHLIGHT", id: state.selected?.rowId ?? null })
                  }, 400)
                }}
                style={{
                  width: viewportW,
                  height: iframeHeight,
                  border: "none",
                  display: "block",
                  transform: `scale(${zoom})`,
                  transformOrigin: "top left",
                }}
                title="Homepage preview"
                sandbox="allow-same-origin allow-scripts allow-forms"
              />
            </div>
          </div>
        </div>

        {/* ── RIGHT: CONTROLS ──────────────────────────────── */}
        <div className="flex w-[300px] shrink-0 flex-col overflow-hidden">
          {/* Section canvas */}
          <div className="shrink-0 border-b border-zinc-800 bg-zinc-900/50 px-3 py-1.5">
            <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">
              Layout Canvas · {activeRows} rows
              {unbalanced > 0 && <span className="ml-1 text-amber-500">· {unbalanced} unbalanced</span>}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {state.config.rows.map(row => (
              <RowItem
                key={row.id}
                row={row}
                selected={state.selected}
                isDragOver={dragOverId === row.id && draggedId !== row.id}
                resizePreview={resizePreview?.rowId === row.id ? { sectionId: resizePreview.sectionId, colSpan: resizePreview.colSpan } : null}
                dispatch={dispatch}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onPreview={(sectionId, colSpan) => setResizePreview({ rowId: row.id, sectionId, colSpan })}
                onCommit={handleCommit}
              />
            ))}
          </div>

          {/* Config panel */}
          <div className="border-t border-zinc-800">
            <div className="border-b border-zinc-800 bg-zinc-900 px-3 py-1">
              <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                {state.selected ? `Configure — ${DEFS[state.selected.sectionId].label}` : "Overview"}
              </p>
            </div>
            <div className="max-h-[320px] overflow-y-auto bg-zinc-900 p-2">
              <ConfigPanel state={state} dispatch={dispatchMode} />
            </div>
          </div>

          {/* Status bar */}
          <div className="flex shrink-0 items-center justify-between border-t border-zinc-800 bg-zinc-900 px-3 py-1">
            <p className="text-[9px]">
              {state.dirty ? <span className="text-amber-500">● Unsaved</span> : <span className="text-emerald-600">✓ Saved</span>}
              <span className="ml-1 text-zinc-700">· {state.past.length} undo</span>
            </p>
            <p className="text-[9px] text-zinc-700">Drag ≡ to reorder</p>
          </div>
        </div>
      </div>
    </div>
  )
}
