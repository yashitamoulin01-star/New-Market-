"use client"

import { useLanguage } from "@/contexts/language-context"

export function T({ en, hi }: { en: string; hi: string }) {
  const { lang } = useLanguage()
  return <>{lang === "hi" ? hi : en}</>
}
