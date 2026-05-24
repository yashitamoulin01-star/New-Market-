"use client"

import { useRef, useState } from "react"
import Link from "next/link"

interface TickerProps {
  headlines: Array<{ title: string; slug: string }>
}

export function NewsTicker({ headlines }: TickerProps) {
  const [paused, setPaused] = useState(false)
  const stripRef = useRef<HTMLDivElement>(null)

  if (headlines.length === 0) return null

  const items = [...headlines, ...headlines]

  return (
    <div className="border-b bg-primary/5 overflow-hidden">
      <div className="flex items-stretch">
        {/* Label */}
        <div className="shrink-0 flex items-center gap-1.5 bg-primary px-3 py-1.5 text-primary-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          <span className="text-xs font-bold uppercase tracking-widest">Live</span>
        </div>

        {/* Scrolling headlines */}
        <div
          className="overflow-hidden flex-1 py-1.5"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => setPaused(false)}
        >
          <div
            ref={stripRef}
            className="flex gap-10 animate-ticker whitespace-nowrap will-change-transform"
            style={{
              contain: "layout style",
              animationPlayState: paused ? "paused" : "running",
            }}
          >
            {items.map((item, i) => (
              <Link
                key={i}
                href={`/news/${item.slug}`}
                className="shrink-0 text-xs text-foreground/80 hover:text-primary transition-colors"
              >
                {item.title}
                <span className="ml-10 text-muted-foreground/40">◆</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
