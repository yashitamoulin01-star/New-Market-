"use client"

import { useFontSize } from "@/contexts/font-size-context"

export function FontSizeToolbar() {
  const { decrease, increase, canDecrease, canIncrease, size } = useFontSize()
  const label = size === "small" ? "S" : size === "large" ? "L" : size === "xlarge" ? "XL" : "M"
  return (
    <div className="flex items-center gap-1 rounded-lg border bg-muted/40 px-1.5 py-1">
      <button
        onClick={decrease}
        disabled={!canDecrease}
        aria-label="Decrease font size"
        className="rounded px-2 py-0.5 text-xs font-bold text-muted-foreground transition hover:bg-background hover:text-foreground disabled:opacity-30"
      >
        A-
      </button>
      <span className="select-none text-[10px] text-muted-foreground/60">{label}</span>
      <button
        onClick={increase}
        disabled={!canIncrease}
        aria-label="Increase font size"
        className="rounded px-2 py-0.5 text-sm font-bold text-muted-foreground transition hover:bg-background hover:text-foreground disabled:opacity-30"
      >
        A+
      </button>
    </div>
  )
}
