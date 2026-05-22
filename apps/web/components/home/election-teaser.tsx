"use client"

import Link from "next/link"
import { Vote, Users, Calendar, ChevronRight, Trophy } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export function ElectionTeaser() {
  const { lang } = useLanguage()
  const hi = lang === "hi"

  const posts = [
    { hi: "अध्यक्ष",            en: "President" },
    { hi: "उपाध्यक्ष",          en: "Vice President" },
    { hi: "सचिव",               en: "Secretary" },
    { hi: "कोषाध्यक्ष",         en: "Treasurer" },
    { hi: "कार्यकारिणी सदस्य",  en: "Executive Member" },
  ]

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between bg-primary px-4 py-3">
        <div className="flex items-center gap-2">
          <Vote size={15} className="text-primary-foreground/80" />
          <h3 className="text-sm font-bold text-primary-foreground">
            {hi ? "व्यापारी महासंघ चुनाव" : "Vyapari Mahasangh Election"}
          </h3>
        </div>
        <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-amber-900 uppercase tracking-wide">
          {hi ? "जल्द आ रहा है" : "Coming Soon"}
        </span>
      </div>

      <div className="p-4">
        {/* Subtitle */}
        <p className="mb-4 text-[11px] text-muted-foreground">
          {hi
            ? "नई मार्केट व्यापारी महासंघ, भोपाल — वार्षिक पदाधिकारी चुनाव"
            : "New Market Vyapari Mahasangh, Bhopal — Annual Officer Elections"}
        </p>

        {/* Posts grid */}
        <div className="mb-4 space-y-1.5">
          {posts.map((post) => (
            <div
              key={post.en}
              className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2"
            >
              <Trophy size={11} className="shrink-0 text-amber-500" />
              <span className="text-xs font-medium">
                {hi ? post.hi : post.en}
              </span>
            </div>
          ))}
        </div>

        {/* Info strip */}
        <div className="mb-4 grid grid-cols-2 gap-2">
          <div className="rounded-lg border bg-background px-3 py-2 text-center">
            <Users size={13} className="mx-auto mb-1 text-primary" />
            <p className="text-[11px] text-muted-foreground">
              {hi ? "OTP आधारित मतदान" : "OTP Voting"}
            </p>
          </div>
          <div className="rounded-lg border bg-background px-3 py-2 text-center">
            <Calendar size={13} className="mx-auto mb-1 text-primary" />
            <p className="text-[11px] text-muted-foreground">
              {hi ? "तिथि शीघ्र" : "Date TBA"}
            </p>
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/election"
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary/10 py-2 text-xs font-semibold text-primary transition hover:bg-primary/20"
        >
          {hi ? "चुनाव हब देखें" : "View Election Hub"}
          <ChevronRight size={13} />
        </Link>
      </div>
    </div>
  )
}
