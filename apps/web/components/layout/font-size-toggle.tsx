"use client"

import { useState, useEffect } from "react"

const SIZES = [14, 16, 18]
const LABELS = ["A−", "A", "A+"]
const KEY = "nm_fontsize"

export function FontSizeToggle() {
  const [idx, setIdx] = useState(1)

  useEffect(() => {
    const saved = localStorage.getItem(KEY)
    const i = saved !== null ? parseInt(saved) : 1
    setIdx(i)
    document.documentElement.style.fontSize = SIZES[i] + "px"
  }, [])

  function cycle() {
    const next = (idx + 1) % 3
    setIdx(next)
    document.documentElement.style.fontSize = SIZES[next] + "px"
    localStorage.setItem(KEY, String(next))
  }

  return (
    <button
      onClick={cycle}
      className="flex h-7 min-w-[28px] items-center justify-center rounded-full border border-white/25 bg-white/10 px-1.5 text-[10px] font-bold text-primary-foreground transition hover:bg-white/20"
      title="Adjust font size"
    >
      {LABELS[idx]}
    </button>
  )
}
