"use client"

import { createContext, useContext, useEffect, useState } from "react"

type FontSize = "small" | "normal" | "large"
const SIZES: FontSize[] = ["small", "normal", "large"]
const CLASS: Record<FontSize, string> = {
  small:  "fs-small",
  normal: "fs-normal",
  large:  "fs-large",
}

interface FontSizeCtx {
  size: FontSize
  increase: () => void
  decrease: () => void
  canIncrease: boolean
  canDecrease: boolean
}

const FontSizeContext = createContext<FontSizeCtx>({
  size: "normal",
  increase: () => {},
  decrease: () => {},
  canIncrease: true,
  canDecrease: true,
})

export function FontSizeProvider({ children }: { children: React.ReactNode }) {
  const [size, setSize] = useState<FontSize>("normal")

  useEffect(() => {
    const saved = localStorage.getItem("nm-font-size") as FontSize | null
    if (saved && SIZES.includes(saved)) setSize(saved)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    SIZES.forEach((s) => root.classList.remove(CLASS[s]))
    root.classList.add(CLASS[size])
    localStorage.setItem("nm-font-size", size)
  }, [size])

  const idx = SIZES.indexOf(size)
  return (
    <FontSizeContext.Provider value={{
      size,
      increase: () => setSize(SIZES[Math.min(idx + 1, SIZES.length - 1)]),
      decrease: () => setSize(SIZES[Math.max(idx - 1, 0)]),
      canIncrease: idx < SIZES.length - 1,
      canDecrease: idx > 0,
    }}>
      {children}
    </FontSizeContext.Provider>
  )
}

export function useFontSize() { return useContext(FontSizeContext) }
