"use client"

import { MapPin } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export function MastheadBar() {
  const { lang } = useLanguage()
  const hi = lang === "hi"

  const today = new Date().toLocaleDateString(
    hi ? "hi-IN" : "en-IN",
    { weekday: "long", day: "numeric", month: "long", year: "numeric" }
  )
  const location = hi ? "न्यू मार्केट, भोपाल" : "New Market, Bhopal"

  return (
    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
      <MapPin size={10} className="text-primary shrink-0" />
      <span className="font-medium text-foreground">{location}</span>
      <span className="mx-1 text-border">|</span>
      <span>{today}</span>
    </div>
  )
}
