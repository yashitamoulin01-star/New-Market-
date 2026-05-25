"use client"

import { createContext, useContext, useEffect, useState } from "react"

type FontSize = "normal" | "a1" | "a2" | "a3"

const SIZES: FontSize[] = ["normal", "a1", "a2", "a3"]

const CLASS: Record<FontSize, string> = {
  normal: "fs-normal",
  a1:     "fs-a1",
  a2:     "fs-a2",
  a3:     "fs-a3",
}

export const FONT_LABEL: Record<FontSize, string> = {
  normal: "Normal",
  a1:     "A+",
  a2:     "A++",
  a3:     "A+++",
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
    const root = document.documentElement
    SIZES.forEach((s) => root.classList.remove(CLASS[s]))
    root.classList.add(CLASS[size])
    localStorage.setItem("nm-font-size", size)
  }, [size])

  return (
    <FontSizeContext.Provider value={{ size, setSize, sizes: SIZES }}>
      {children}
    </FontSizeContext.Provider>
  )
}

export function useFontSize() { return useContext(FontSizeContext) }
