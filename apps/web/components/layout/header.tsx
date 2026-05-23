"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { LanguageToggle } from "./language-toggle"
import { UserNav } from "./user-nav"
import { translations as t } from "@/lib/i18n"
import type { User } from "@supabase/supabase-js"

interface HeaderProps {
  initialUser?: User | null
}

export function Header({ initialUser }: HeaderProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { lang } = useLanguage()

  const navLinks = [
    { href: "/",         label: t.nav.home[lang] },
    { href: "/news",     label: t.nav.news[lang] },
    { href: "/jobs",     label: t.nav.jobs[lang] },
    { href: "/shops",    label: t.nav.shops[lang] },
    { href: "/property", label: t.nav.property[lang] },
    { href: "/election", label: t.nav.election[lang] },
  ]

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href)

  return (
    <header className="sticky top-0 z-50 w-full shadow-sm">
      {/* Brand bar */}
      <div className="bg-primary">
        <div className="container flex h-11 items-center justify-between gap-4">
          <Link
            href="/"
            className="shrink-0 text-xl font-bold tracking-tight text-primary-foreground"
          >
            {lang === "hi" ? "न्यूमार्केट" : "NewMarket"}
            <span className="font-normal opacity-70">.co.in</span>
          </Link>

          <span className="hidden flex-1 text-center text-sm text-primary-foreground/70 sm:block">
            {t.nav.tagline[lang]}
          </span>

          <div className="flex items-center gap-2">
            <LanguageToggle />
            <UserNav initialUser={initialUser} />
            {/* Mobile hamburger */}
            <button
              className="rounded p-1.5 text-primary-foreground/80 hover:text-primary-foreground sm:hidden"
              onClick={() => setOpen(!open)}
              aria-label="Toggle navigation"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop nav */}
      <div className="hidden border-b bg-background shadow-[0_1px_0_0_hsl(var(--border))] sm:block">
        <nav className="container flex items-center gap-0">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile dropdown — always in DOM, animated via max-height */}
      <div
        className={`overflow-hidden border-b bg-background shadow-md sm:hidden transition-all duration-200 ease-out ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="container py-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center border-b border-border py-3 text-sm font-medium last:border-0 ${
                isActive(link.href)
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setOpen(false)}
            >
              {isActive(link.href) && (
                <span className="mr-2 h-1.5 w-1.5 rounded-full bg-primary" />
              )}
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
