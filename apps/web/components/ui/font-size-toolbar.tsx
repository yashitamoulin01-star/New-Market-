"use client"

import { useFontSize, FONT_LABEL } from "@/contexts/font-size-context"

export function FontSizeToolbar() {
  const { size, setSize, sizes } = useFontSize()

  return (
    <div className="flex items-center gap-0.5 rounded-lg border bg-muted/40 p-0.5">
      {sizes.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => setSize(s)}
          aria-label={`Font size ${FONT_LABEL[s]}`}
          aria-pressed={size === s}
          className={`rounded px-3 py-1.5 text-[12px] font-bold transition-all ${
            size === s
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-background/80 hover:text-foreground"
          }`}
        >
          {FONT_LABEL[s]}
        </button>
      ))}
    </div>
  )
}
