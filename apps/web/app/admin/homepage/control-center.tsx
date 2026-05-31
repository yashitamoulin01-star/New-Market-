"use client"

import { useState, useRef, useEffect } from "react"
import {
  Home, RefreshCw, ExternalLink, Layers, Monitor, Wand2,
  CheckCircle2, AlertCircle, Loader2, Zap, Settings2,
  Megaphone, Radio, BarChart3, Image, AlignLeft, TrendingUp, X,
} from "lucide-react"
import type { HomepageSettings } from "@/lib/supabase/homepage-settings"
import type { LayoutConfig, LayoutMeta } from "@/lib/supabase/layout-config"
import { DEFAULT_LAYOUT_META } from "@/lib/supabase/layout-config"
import { BuilderClient } from "./builder/builder-client"
import { saveControlCenterAction } from "./actions"

type Tab = "dashboard" | "builder"
type SaveStatus = "idle" | "saving" | "saved" | "error"

// ─── Section groups ───────────────────────────────────────────────────────────

const SECTION_GROUPS = [
  {
    title: "News Zone",
    icon: Radio,
    accent: "bg-blue-500/10 border-blue-500/20",
    iconClass: "text-blue-500",
    items: [
      { key: "show_hero_news",    label: "Main Top Story",      desc: "Featured article — large hero with photo or text-split layout" },
      { key: "show_mini_grid",    label: "Top Side Stories",   desc: "2×2 compact cards alongside the main story" },
      { key: "show_latest_panel", label: "Recent News Sidebar",desc: "Scrollable panel of the latest articles" },
      { key: "show_trending",     label: "Trending Stories",   desc: "Horizontal strip of trending articles" },
      { key: "show_text_stories", label: "Quick Headlines",    desc: "Compact text-only headline list" },
      { key: "show_section_links",label: "Navigation Links",   desc: "News / Jobs / Shops / Elections quick-nav bar" },
      { key: "show_ticker",       label: "Breaking Ticker",    desc: "Scrolling breaking-news bar at top of page" },
    ],
  },
  {
    title: "Content Widgets",
    icon: Layers,
    accent: "bg-emerald-500/10 border-emerald-500/20",
    iconClass: "text-emerald-500",
    items: [
      { key: "show_jobs_panel",     label: "Jobs Panel",          desc: "Latest job listings panel on homepage" },
      { key: "show_youtube",        label: "Video Section",      desc: "Embedded YouTube video highlights" },
      { key: "show_local_updates",  label: "Local Updates Grid", desc: "Compact grid of neighbourhood news" },
      { key: "show_elections",      label: "Elections Card",     desc: "Active election teaser and live results" },
      { key: "show_property_panel", label: "Property Teaser",   desc: "Recent property listings in sidebar" },
      { key: "show_shops_strip",    label: "Featured Shops Row", desc: "Strip showing 4 highlighted local shops" },
      { key: "show_community_strip",label: "Community Banner",   desc: "Submit news / jobs / shops call-to-action" },
    ],
  },
  {
    title: "Ad Slots",
    icon: Megaphone,
    accent: "bg-amber-500/10 border-amber-500/20",
    iconClass: "text-amber-500",
    items: [
      { key: "show_top_ad",    label: "Top Banner Ad",    desc: "Full-width leaderboard above stories" },
      { key: "show_left_ad",   label: "Left Sidebar Ad",  desc: "Skyscraper (xl screens only)" },
      { key: "show_right_ad",  label: "Right Sidebar Ad", desc: "Skyscraper (xl screens only)" },
      { key: "show_mid_ad",    label: "Mid-Page Ad",      desc: "Between news and YouTube" },
      { key: "show_bottom_ad", label: "Bottom Strip Ad",  desc: "Narrow strip near page bottom" },
    ],
  },
]

const SPATIAL_CONTROLS: { key: keyof LayoutMeta; label: string; desc: string }[] = [
  { key: "auto_balance",         label: "Auto Balance",          desc: "Resizing triggers proportional sibling redistribution" },
  { key: "smart_healing",        label: "Smart Healing",         desc: "Disabled sections auto-fill freed space" },
  { key: "auto_expand",          label: "Auto Expand",           desc: "Siblings expand when a section is removed" },
  { key: "collision_prevention", label: "Collision Prevention",  desc: "Blocks never overlap or exceed 12 columns" },
  { key: "fallback_replacement", label: "Fallback Replacement",  desc: "Empty slots get smart auto-fill content" },
]

// ─── Toast notification ───────────────────────────────────────────────────────

function Toast({ status, errorMsg, onDismiss }: {
  status: SaveStatus
  errorMsg: string | null
  onDismiss: () => void
}) {
  const visible = status === "saved" || status === "error" || status === "saving"

  useEffect(() => {
    if (status === "saved" || status === "error") {
      const t = setTimeout(onDismiss, status === "saved" ? 4000 : 7000)
      return () => clearTimeout(t)
    }
  }, [status, onDismiss])

  if (!visible) return null

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-start gap-3 rounded-xl border px-4 py-3 shadow-xl transition-all duration-300 max-w-sm
        ${status === "saving" ? "border-border bg-card text-foreground" : ""}
        ${status === "saved"  ? "border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300" : ""}
        ${status === "error"  ? "border-red-500/40 bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-300" : ""}
      `}
    >
      <span className="mt-0.5 shrink-0">
        {status === "saving" && <Loader2 size={15} className="animate-spin text-muted-foreground" />}
        {status === "saved"  && <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400" />}
        {status === "error"  && <AlertCircle size={15} className="text-red-600 dark:text-red-400" />}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-tight">
          {status === "saving" && "Saving changes…"}
          {status === "saved"  && "Saved & published!"}
          {status === "error"  && "Save failed"}
        </p>
        {status === "saved" && (
          <p className="mt-0.5 text-xs opacity-75">Homepage updated. Changes are now live.</p>
        )}
        {status === "error" && errorMsg && (
          <p className="mt-0.5 text-xs opacity-75 break-words">{errorMsg}</p>
        )}
      </div>
      {(status === "saved" || status === "error") && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded p-0.5 opacity-60 hover:opacity-100 transition"
        >
          <X size={13} />
        </button>
      )}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TabBtn({ id, label, icon: Icon, active, onClick }: {
  id: Tab; label: string; icon: React.ElementType; active: boolean; onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
        active
          ? "border-primary text-primary"
          : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
      }`}
    >
      <Icon size={14} />
      {label}
    </button>
  )
}

function SwitchToggle({
  checked,
  onChange,
}: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        checked ? "bg-primary" : "bg-muted-foreground/30"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  )
}

function SectionToggleItem({
  name,
  label,
  desc,
  defaultChecked,
}: { name: string; label: string; desc: string; defaultChecked: boolean }) {
  const [checked, setChecked] = useState(defaultChecked)
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border bg-card px-3 py-2.5 transition hover:bg-muted/30">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={e => setChecked(e.target.checked)}
        className="sr-only"
      />
      <SwitchToggle checked={checked} onChange={setChecked} />
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-[12px] font-semibold leading-tight text-foreground">{label}</p>
        <p className="mt-0.5 text-[10px] leading-tight text-muted-foreground">{desc}</p>
      </div>
    </label>
  )
}

function MetaSwitch({
  value,
  label,
  desc,
  onChange,
}: { value: boolean; label: string; desc: string; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start gap-3">
      <SwitchToggle checked={value} onChange={onChange} />
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-semibold leading-tight text-foreground">{label}</p>
        <p className="mt-0.5 text-[10px] leading-tight text-muted-foreground">{desc}</p>
      </div>
    </div>
  )
}

function SectionCard({
  title,
  icon: Icon,
  accent,
  iconClass,
  children,
}: {
  title: string; icon: React.ElementType; accent: string; iconClass: string; children: React.ReactNode
}) {
  return (
    <div className={`overflow-hidden rounded-xl border ${accent}`}>
      <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-2.5">
        <Icon size={13} className={iconClass} />
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{title}</p>
      </div>
      <div className="grid grid-cols-1 gap-1.5 p-3 sm:grid-cols-2">{children}</div>
    </div>
  )
}

function StatusBadge({ status }: { status: SaveStatus }) {
  if (status === "saving") return (
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Loader2 size={12} className="animate-spin" /> Saving…
    </span>
  )
  if (status === "saved") return (
    <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
      <CheckCircle2 size={12} /> Saved & live
    </span>
  )
  if (status === "error") return (
    <span className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
      <AlertCircle size={12} /> Save failed
    </span>
  )
  return (
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Live
    </span>
  )
}

// ─── Dashboard Tab ────────────────────────────────────────────────────────────

function DashboardTab({
  settings,
  meta,
  setMeta,
  formRef,
}: {
  settings: HomepageSettings
  meta: LayoutMeta
  setMeta: (fn: (m: LayoutMeta) => LayoutMeta) => void
  formRef: React.RefObject<HTMLFormElement | null>
}) {
  return (
    <form ref={formRef} className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-2">
      {/* Left column — section visibility */}
      <div className="space-y-5">
        {SECTION_GROUPS.map(g => (
          <SectionCard key={g.title} title={g.title} icon={g.icon} accent={g.accent} iconClass={g.iconClass}>
            {g.items.map(item => (
              <SectionToggleItem
                key={item.key}
                name={item.key}
                label={item.label}
                desc={item.desc}
                defaultChecked={settings[item.key as keyof HomepageSettings] as boolean}
              />
            ))}
          </SectionCard>
        ))}
      </div>

      {/* Right column — layout + intelligence + priority */}
      <div className="space-y-5">

        {/* Hero Style */}
        <div className="overflow-hidden rounded-xl border">
          <div className="border-b bg-muted/30 px-4 py-2.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Hero Layout Style</p>
          </div>
          <div className="grid grid-cols-2 gap-3 p-4">
            {(["photo", "text-split"] as const).map(v => (
              <label key={v} className="flex cursor-pointer items-start gap-3 rounded-lg border-2 p-3 transition has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                <input type="radio" name="hero_style" value={v} defaultChecked={settings.hero_style === v} className="mt-0.5 accent-primary" />
                <div>
                  <p className="text-xs font-semibold">{v === "photo" ? "Photo Hero" : "Text-Split"}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {v === "photo" ? "Full image with gradient overlay" : "Large headline + clean image right"}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Layout Density */}
        <div className="overflow-hidden rounded-xl border">
          <div className="border-b bg-muted/30 px-4 py-2.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Layout Density</p>
          </div>
          <div className="grid grid-cols-2 gap-3 p-4">
            {(["spacious", "compact"] as const).map(v => (
              <label key={v} className="flex cursor-pointer items-start gap-3 rounded-lg border-2 p-3 transition has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                <input type="radio" name="layout_density" value={v} defaultChecked={settings.layout_density === v} className="mt-0.5 accent-primary" />
                <div>
                  <p className="text-xs font-semibold capitalize">{v}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {v === "spacious" ? "Generous padding between sections" : "Tighter spacing, more above fold"}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Sidebar Fallback */}
        <div className="overflow-hidden rounded-xl border">
          <div className="border-b bg-muted/30 px-4 py-2.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Smart Sidebar Fallback</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">When sidebar ads are OFF, auto-fill with this content</p>
          </div>
          <div className="grid grid-cols-2 gap-4 p-4">
            {(["left_sidebar_fallback", "right_sidebar_fallback"] as const).map(name => (
              <div key={name}>
                <label className="mb-1.5 block text-xs font-semibold capitalize">
                  {name === "left_sidebar_fallback" ? "Left Sidebar" : "Right Sidebar"}
                </label>
                <select
                  name={name}
                  defaultValue={settings[name]}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="trending">🔥 Trending Stories</option>
                  <option value="latest">⚡ Latest News</option>
                  <option value="jobs">💼 Jobs Teaser</option>
                  <option value="community">🤝 Community Subscribe</option>
                  <option value="none">✕ None (collapse)</option>
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Spatial Intelligence */}
        <div className="overflow-hidden rounded-xl border border-violet-500/20 bg-violet-500/5">
          <div className="flex items-center gap-2 border-b border-violet-500/20 px-4 py-2.5">
            <Zap size={13} className="text-violet-500" />
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Spatial Intelligence</p>
          </div>
          <div className="space-y-3 p-4">
            {SPATIAL_CONTROLS.map(ctrl => (
              <MetaSwitch
                key={ctrl.key}
                value={meta[ctrl.key] as boolean}
                label={ctrl.label}
                desc={ctrl.desc}
                onChange={v => setMeta(m => ({ ...m, [ctrl.key]: v }))}
              />
            ))}
          </div>
        </div>

        {/* Content Priority */}
        <div className="overflow-hidden rounded-xl border border-sky-500/20 bg-sky-500/5">
          <div className="flex items-center gap-2 border-b border-sky-500/20 px-4 py-2.5">
            <BarChart3 size={13} className="text-sky-500" />
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Content Priority</p>
          </div>
          <div className="space-y-4 p-4">
            <div>
              <p className="mb-2 text-xs font-semibold">Ad Priority</p>
              <div className="flex gap-2">
                {(["high", "normal", "low"] as const).map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setMeta(m => ({ ...m, ad_priority: v }))}
                    className={`flex-1 rounded-lg border py-1.5 text-xs font-semibold capitalize transition ${
                      meta.ad_priority === v
                        ? "border-amber-500 bg-amber-500/10 text-amber-600"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold">Article Display</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMeta(m => ({ ...m, content_priority: "image_first" }))}
                  className={`flex items-center gap-2 rounded-lg border p-2.5 text-xs font-semibold transition ${
                    meta.content_priority === "image_first"
                      ? "border-primary bg-primary/5 text-primary"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <Image size={12} /> Image first
                </button>
                <button
                  type="button"
                  onClick={() => setMeta(m => ({ ...m, content_priority: "text_first" }))}
                  className={`flex items-center gap-2 rounded-lg border p-2.5 text-xs font-semibold transition ${
                    meta.content_priority === "text_first"
                      ? "border-primary bg-primary/5 text-primary"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <AlignLeft size={12} /> Text first
                </button>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold">Trending Preference</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMeta(m => ({ ...m, trending_preference: "trending" }))}
                  className={`flex items-center gap-2 rounded-lg border p-2.5 text-xs font-semibold transition ${
                    meta.trending_preference === "trending"
                      ? "border-primary bg-primary/5 text-primary"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <TrendingUp size={12} /> Trending
                </button>
                <button
                  type="button"
                  onClick={() => setMeta(m => ({ ...m, trending_preference: "latest" }))}
                  className={`flex items-center gap-2 rounded-lg border p-2.5 text-xs font-semibold transition ${
                    meta.trending_preference === "latest"
                      ? "border-primary bg-primary/5 text-primary"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <Radio size={12} /> Latest
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}

// ─── Main Control Center ──────────────────────────────────────────────────────

export function ControlCenter({
  settings,
  layoutConfig,
}: {
  settings: HomepageSettings
  layoutConfig: LayoutConfig
}) {
  const [tab, setTab] = useState<Tab>("dashboard")
  const [status, setStatus] = useState<SaveStatus>("idle")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [previewKey, setPreviewKey] = useState(0)
  const [meta, setMeta] = useState<LayoutMeta>({
    ...DEFAULT_LAYOUT_META,
    ...(layoutConfig.meta ?? {}),
  })
  const formRef = useRef<HTMLFormElement | null>(null)

  async function handleSave() {
    if (!formRef.current) return
    setStatus("saving")
    setErrorMsg(null)
    const formData = new FormData(formRef.current)
    const result = await saveControlCenterAction(formData, meta)
    if (result.error) {
      setStatus("error")
      setErrorMsg(result.error)
    } else {
      setStatus("saved")
      setPreviewKey(k => k + 1)
    }
  }

  function dismissToast() {
    setStatus("idle")
    setErrorMsg(null)
  }

  const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "dashboard", label: "Dashboard",      icon: Settings2 },
    { id: "builder",   label: "Visual Builder", icon: Wand2 },
  ]

  return (
    <div className="flex flex-col" style={{ minHeight: "calc(100vh - 44px)" }}>

      {/* ── Sticky header ──────────────────────────────────────── */}
      <div className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b bg-background/95 px-6 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Home size={15} className="text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight">Homepage Control Center</h1>
            <StatusBadge status={status} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {errorMsg && (
            <p className="hidden text-xs text-red-600 sm:block max-w-[200px] truncate">{errorMsg}</p>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={status === "saving"}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
          >
            {status === "saving" ? (
              <><Loader2 size={12} className="animate-spin" /> Saving…</>
            ) : (
              <><CheckCircle2 size={12} /> Save & Publish</>
            )}
          </button>
          <a
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition hover:bg-muted/60"
          >
            <ExternalLink size={11} /> View Live
          </a>
        </div>
      </div>

      {/* ── Tab bar ────────────────────────────────────────────── */}
      <div className="flex border-b bg-muted/10 px-4">
        {TABS.map(t => (
          <TabBtn key={t.id} id={t.id} label={t.label} icon={t.icon} active={tab === t.id} onClick={() => setTab(t.id)} />
        ))}
      </div>

      {/* ── Tab content ────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden">
        {tab === "dashboard" && (
          <DashboardTab
            settings={settings}
            meta={meta}
            setMeta={setMeta}
            formRef={formRef}
          />
        )}
        {tab === "builder" && (
          <div className="flex h-full">
            {/* Builder controls */}
            <div className="w-[420px] shrink-0 overflow-y-auto border-r">
              <BuilderClient initialConfig={layoutConfig} />
            </div>
            {/* Inline live preview */}
            <div className="flex flex-1 flex-col min-w-0">
              <div className="flex items-center gap-2 border-b bg-muted/20 px-4 py-2 shrink-0">
                <Monitor size={13} className="text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground">Live Preview</span>
                <div className="ml-auto flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewKey(k => k + 1)}
                    className="flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition hover:bg-muted/60"
                  >
                    <RefreshCw size={11} /> Refresh
                  </button>
                  <a
                    href="/"
                    target="_blank"
                    className="flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition hover:bg-muted/60"
                  >
                    <ExternalLink size={11} /> Open tab
                  </a>
                </div>
              </div>
              <div className="relative flex-1">
                <iframe
                  key={previewKey}
                  src="/"
                  title="Homepage preview"
                  className="absolute inset-0 h-full w-full border-0"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Toast notification ─────────────────────────────────── */}
      <Toast status={status} errorMsg={errorMsg} onDismiss={dismissToast} />
    </div>
  )
}
