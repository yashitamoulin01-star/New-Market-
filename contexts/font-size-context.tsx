"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type FontSize = "normal" | "a1" | "a2" | "a3" | "a4"

const SIZES: FontSize[] = ["normal", "a1", "a2", "a3", "a4"]
const STORAGE_KEY = "nm-font-size"

interface FontSizeContextValue {
  size: FontSize
  increase: () => void
  decrease: () => void
  canIncrease: boolean
  canDecrease: boolean
}

const FontSizeContext = createContext<FontSizeContextValue>({
  size: "normal",
  increase: () => {},
  decrease: () => {},
  canIncrease: true,
  canDecrease: true,
})

export function FontSizeProvider({ children }: { children: ReactNode }) {
  const [size, setSize] = useState<FontSize>("normal")

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as FontSize | null
    if (saved && SIZES.includes(saved)) setSize(saved)
  }, [])

  useEffect(() => {
    const html = document.documentElement
    html.classList.remove("fs-normal", "fs-a1", "fs-a2", "fs-a3", "fs-a4")
    html.classList.add(`fs-${size}`)
    localStorage.setItem(STORAGE_KEY, size)
  }, [size])

  const idx = SIZES.indexOf(size)

  function increase() {
    if (idx < SIZES.length - 1) setSize(SIZES[idx + 1])
  }
  function decrease() {
    if (idx > 0) setSize(SIZES[idx - 1])
  }

  return (
    <FontSizeContext.Provider value={{
      size,
      increase,
      decrease,
      canIncrease: idx < SIZES.length - 1,
      canDecrease: idx > 0,
    }}>
      {children}
    </FontSizeContext.Provider>
  )
}

export function useFontSize() {
  return useContext(FontSizeContext)
}
