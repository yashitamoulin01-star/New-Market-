"use client"

import { useState } from "react"

// ── Mini SVG Line/Area Chart ──────────────────────────────────────────────────

export function SparkLine({
  data,
  color = "#6366f1",
  height = 80,
}: {
  data: { date: string; count: number }[]
  color?: string
  height?: number
}) {
  const W = 600
  const H = height
  const padL = 32, padR = 12, padT = 8, padB = 28
  const cW = W - padL - padR
  const cH = H - padT - padB
  const max = Math.max(...data.map(d => d.count), 1)
  const n = data.length

  const px = (i: number) => padL + (n <= 1 ? cW / 2 : (i / (n - 1)) * cW)
  const py = (v: number) => padT + cH - (v / max) * cH

  const linePoints = data.map((d, i) => `${px(i)},${py(d.count)}`).join(" ")
  const areaPoints = [
    `${px(0)},${padT + cH}`,
    ...data.map((d, i) => `${px(i)},${py(d.count)}`),
    `${px(n - 1)},${padT + cH}`,
  ].join(" ")

  // Grid: 0%, 50%, 100%
  const gridVals = [0, 0.5, 1]
  // X-axis labels: first, mid, last
  const xLabels = n > 2
    ? [0, Math.floor((n - 1) / 2), n - 1]
    : n === 2 ? [0, 1] : [0]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      {/* Grid lines */}
      {gridVals.map(v => (
        <line key={v}
          x1={padL} x2={padL + cW}
          y1={padT + cH * (1 - v)} y2={padT + cH * (1 - v)}
          stroke="currentColor" strokeOpacity={0.08} strokeDasharray="4,4" strokeWidth={1}
        />
      ))}
      {/* Y axis label */}
      <text x={padL - 4} y={padT + 4} fontSize={10} fill="currentColor" fillOpacity={0.4} textAnchor="end">{max}</text>
      <text x={padL - 4} y={padT + cH} fontSize={10} fill="currentColor" fillOpacity={0.4} textAnchor="end">0</text>

      {/* Area fill */}
      {n > 1 && <polygon points={areaPoints} fill={color} fillOpacity={0.12} />}

      {/* Line */}
      {n > 1 && (
        <polyline points={linePoints} fill="none" stroke={color} strokeWidth={2}
          strokeLinecap="round" strokeLinejoin="round" />
      )}

      {/* Data points */}
      {data.map((d, i) => (
        <circle key={i} cx={px(i)} cy={py(d.count)} r={n <= 14 ? 3 : 2}
          fill={color} stroke="white" strokeWidth={1.5} />
      ))}

      {/* X labels */}
      {xLabels.map(i => (
        <text key={i} x={px(i)} y={H - 4} fontSize={9} fill="currentColor" fillOpacity={0.45} textAnchor="middle">
          {formatAxisDate(data[i]?.date ?? "")}
        </text>
      ))}
    </svg>
  )
}

function formatAxisDate(iso: string) {
  if (!iso) return ""
  const d = new Date(iso)
  return `${d.getDate()}/${d.getMonth() + 1}`
}

// ── Horizontal Bar Chart ──────────────────────────────────────────────────────

export function HBar({
  data,
  color = "#6366f1",
}: {
  data: { label: string; count: number; sublabel?: string }[]
  color?: string
}) {
  const max = Math.max(...data.map(d => d.count), 1)
  return (
    <div className="space-y-3">
      {data.map(({ label, count, sublabel }) => (
        <div key={label} className="flex items-center gap-3">
          <div className="w-28 shrink-0 text-right">
            <p className="text-xs font-medium leading-tight truncate">{label}</p>
            {sublabel && <p className="text-[10px] text-muted-foreground">{sublabel}</p>}
          </div>
          <div className="flex-1 h-6 bg-muted/30 rounded overflow-hidden">
            <div
              className="h-full rounded transition-all duration-500"
              style={{ width: `${Math.max((count / max) * 100, count > 0 ? 2 : 0)}%`, backgroundColor: color }}
            />
          </div>
          <span className="w-10 shrink-0 text-right text-xs font-bold tabular-nums">{count.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

// ── Donut Chart ───────────────────────────────────────────────────────────────

export function DonutChart({
  data,
}: {
  data: { label: string; count: number; color: string }[]
}) {
  const [hovered, setHovered] = useState<string | null>(null)
  const total = data.reduce((s, d) => s + d.count, 0)
  if (total === 0) return <p className="text-center text-sm text-muted-foreground py-6">No data</p>

  const R = 70, r = 42, cx = 100, cy = 100
  let angle = -Math.PI / 2

  const slices = data.map(d => {
    const pct = d.count / total
    const sweep = pct * 2 * Math.PI
    const x1 = cx + R * Math.cos(angle)
    const y1 = cy + R * Math.sin(angle)
    const x2 = cx + R * Math.cos(angle + sweep)
    const y2 = cy + R * Math.sin(angle + sweep)
    const ix1 = cx + r * Math.cos(angle)
    const iy1 = cy + r * Math.sin(angle)
    const ix2 = cx + r * Math.cos(angle + sweep)
    const iy2 = cy + r * Math.sin(angle + sweep)
    const large = sweep > Math.PI ? 1 : 0
    const path = [
      `M ${x1} ${y1}`,
      `A ${R} ${R} 0 ${large} 1 ${x2} ${y2}`,
      `L ${ix2} ${iy2}`,
      `A ${r} ${r} 0 ${large} 0 ${ix1} ${iy1}`,
      "Z",
    ].join(" ")
    angle += sweep
    return { ...d, path, pct }
  })

  const hov = hovered ? data.find(d => d.label === hovered) : null

  return (
    <div className="flex items-center gap-6">
      <div className="shrink-0" style={{ width: 200 }}>
        <svg viewBox="0 0 200 200" width={200} height={200}>
          {slices.map(s => (
            <path
              key={s.label}
              d={s.path}
              fill={s.color}
              opacity={hovered && hovered !== s.label ? 0.4 : 1}
              className="transition-opacity cursor-pointer"
              onMouseEnter={() => setHovered(s.label)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}
          {/* Center label */}
          <text x={cx} y={cy - 6} textAnchor="middle" fontSize={18} fontWeight="bold" fill="currentColor">
            {hov ? hov.count : total}
          </text>
          <text x={cx} y={cy + 12} textAnchor="middle" fontSize={9} fill="currentColor" fillOpacity={0.5}>
            {hov ? hov.label : "total"}
          </text>
        </svg>
      </div>
      <div className="flex-1 space-y-2">
        {slices.map(s => (
          <div key={s.label}
            className="flex items-center gap-2 cursor-default"
            onMouseEnter={() => setHovered(s.label)}
            onMouseLeave={() => setHovered(null)}
          >
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="flex-1 text-xs">{s.label}</span>
            <span className="text-xs font-bold tabular-nums">{s.count}</span>
            <span className="text-[10px] text-muted-foreground w-9 text-right">{(s.pct * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Range Switcher (client UI) ────────────────────────────────────────────────

export function RangeSwitcher({ current }: { current: string }) {
  const ranges = [
    { value: "today", label: "Today" },
    { value: "7",  label: "7 Days" },
    { value: "30", label: "30 Days" },
    { value: "all", label: "All Time" },
  ]
  return (
    <div className="flex gap-1 rounded-lg border bg-muted/30 p-1">
      {ranges.map(r => (
        <a
          key={r.value}
          href={`?range=${r.value}`}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            current === r.value
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          }`}
        >
          {r.label}
        </a>
      ))}
    </div>
  )
}
