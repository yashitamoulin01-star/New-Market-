"use client"

import { useFontSize, FONT_LABEL } from "@/contexts/font-size-context"

export function FontSizeToolbar() {
  const { size, setSize, sizes } = useFontSize()

  return (
    <div className="flex items-center gap-0.5 rounded-lg border bg-muted/40 p-0.5">
      {sizes.map((s) => (
        <button
          key={s}
          onClick={() => setSize(s)}
          aria-label={`Font size ${FONT_LABEL[s]}`}
          className={`rounded px-2 py-1 text-[11px] font-semibold transition-all ${
            size === s
              ? "bg-background text-foreground shadow-sm ring-1 ring-border"
              : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
          }`}
        >
          {FONT_LABEL[s]}
        </button>
      ))}
    </div>
  )
}
