"use client"

import { useLanguage } from "@/contexts/language-context"

interface AdBannerProps {
  slot: string
  size?: "leaderboard" | "rectangle" | "strip"
  className?: string
}

export function AdBanner({ slot, size = "leaderboard", className = "" }: AdBannerProps) {
  const { lang } = useLanguage()

  const dims = {
    leaderboard: "h-20 sm:h-24",
    rectangle:   "h-48 sm:h-60",
    strip:       "h-12",
  }[size]

  return (
    <div
      className={`flex items-center justify-center border-y bg-gradient-to-r from-amber-50 via-white to-amber-50 ${dims} ${className}`}
      data-ad-slot={slot}
    >
      <div className="flex flex-col items-center gap-0.5 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-600/60">
          {lang === "hi" ? "विज्ञापन" : "Advertisement"}
        </p>
        <p className="text-xs text-muted-foreground/50">
          {lang === "hi"
            ? "यहाँ विज्ञापन दें — contact@newmarket.co.in"
            : "Advertise here — contact@newmarket.co.in"}
        </p>
      </div>
    </div>
  )
}
