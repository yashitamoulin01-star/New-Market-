"use client"

import { useLanguage } from "@/contexts/language-context"

export function LanguageToggle() {
  const { lang, setLang } = useLanguage()
  const isHindi = lang === "hi"

  return (
    <button
      onClick={() => setLang(isHindi ? "en" : "hi")}
      className="flex items-center gap-1 rounded-full border border-white/25 bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-primary-foreground transition hover:bg-white/20"
      aria-label="Toggle language"
    >
      <span className={isHindi ? "opacity-50" : "opacity-100"}>EN</span>
      <span className="opacity-30">|</span>
      <span className={isHindi ? "opacity-100" : "opacity-50"}>हिं</span>
    </button>
  )
}
