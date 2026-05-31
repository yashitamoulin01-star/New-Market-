"use client"

import { createContext, useContext, useEffect, useState } from "react"

type FontSize = "normal" | "a1" | "a2" | "a3" | "a4"

const SIZES: FontSize[] = ["normal", "a1", "a2", "a3", "a4"]

const ZOOM: Record<FontSize, string> = {
  normal: "",
  a1:     "1.11",
  a2:     "1.27",
  a3:     "1.44",
  a4:     "1.67",
}

export const FONT_LABEL: Record<FontSize, string> = {
  normal: "A",
  a1:     "A+",
  a2:     "A++",
  a3:     "A+++",
  a4:     "A++++",
}

interface FontSizeCtx {
  size: FontSize
  setSize: (s: FontSize) => void
  sizes: FontSize[]
}

const FontSizeContext = createContext<FontSizeCtx>({
  size: "normal",
  setSize: () => {},
  sizes: SIZES,
})

export function FontSizeProvider({ children }: { children: React.ReactNode }) {
  const [size, setSize] = useState<FontSize>("normal")

  useEffect(() => {
    const saved = localStorage.getItem("nm-font-size") as FontSize | null
    if (saved && SIZES.includes(saved)) setSize(saved)
  }, [])

  useEffect(() => {
    // Apply zoom directly via inline style — faster than class toggling
    document.documentElement.style.zoom = ZOOM[size]
    localStorage.setItem("nm-font-size", size)
  }, [size])

  return (
    <FontSizeContext.Provider value={{ size, setSize, sizes: SIZES }}>
      {children}
    </FontSizeContext.Provider>
  )
}

export function useFontSize() { return useContext(FontSizeContext) }
