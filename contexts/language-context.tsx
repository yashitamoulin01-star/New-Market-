"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Lang } from "@/lib/i18n"

interface LangCtxValue {
  lang: Lang
  setLang: (l: Lang) => void
}

const LangCtx = createContext<LangCtxValue>({ lang: "en", setLang: () => {} })

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en")

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("nm_lang") : null
    if (saved === "en" || saved === "hi") setLang(saved)
  }, [])

  function handleSetLang(l: Lang) {
    setLang(l)
    localStorage.setItem("nm_lang", l)
  }

  return (
    <LangCtx.Provider value={{ lang, setLang: handleSetLang }}>
      {children}
    </LangCtx.Provider>
  )
}

export const useLanguage = () => useContext(LangCtx)
