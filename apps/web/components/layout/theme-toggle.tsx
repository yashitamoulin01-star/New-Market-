"use client"

import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex h-7 w-7 items-center justify-center rounded-full border border-white/25 bg-white/10 text-primary-foreground transition hover:bg-white/20"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
    </button>
  )
}
