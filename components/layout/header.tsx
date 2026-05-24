"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, X, ALargeSmall } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useFontSize } from "@/contexts/font-size-context"
import { LanguageToggle } from "./language-toggle"
import { UserNav } from "./user-nav"
import { translations as t } from "@/lib/i18n"

export function Header() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { lang } = useLanguage()
  const { increase, decrease, canIncrease, canDecrease } = useFontSize()

  const navLinks = [
    { href: "/",         label: t.nav.home[lang] },
    { href: "/news",     label: t.nav.news[lang] },
    { href: "/jobs",     label: t.nav.jobs[lang] },
    { href: "/shops",    label: t.nav.shops[lang] },
    { href: "/property", label: t.nav.property[lang] },
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
            NewMarket
            <span className="font-normal opacity-70">.co.in</span>
          </Link>

          <span className="hidden flex-1 text-center text-sm text-primary-foreground/70 sm:block">
            {t.nav.tagline[lang]}
          </span>

          <div className="flex items-center gap-1.5">
            {/* Font size controls */}
            <div className="hidden sm:flex items-center gap-0.5 rounded-full border border-white/20 bg-white/10 px-1 py-0.5">
              <button
                onClick={decrease}
                disabled={!canDecrease}
                aria-label="Decrease font size"
                className="flex h-6 w-6 items-center justify-center rounded-full text-primary-foreground/70 text-xs font-bold hover:bg-white/20 disabled:opacity-30 transition"
              >
                A–
              </button>
              <ALargeSmall size={12} className="text-primary-foreground/50 mx-0.5" />
              <button
                onClick={increase}
                disabled={!canIncrease}
                aria-label="Increase font size"
                className="flex h-6 w-6 items-center justify-center rounded-full text-primary-foreground/70 text-sm font-bold hover:bg-white/20 disabled:opacity-30 transition"
              >
                A+
              </button>
            </div>

            <LanguageToggle />
            <UserNav />
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

      {/* Mobile dropdown */}
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
          {/* Mobile font size controls */}
          <div className="flex items-center gap-3 border-b border-border py-3">
            <ALargeSmall size={14} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Font size</span>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={decrease}
                disabled={!canDecrease}
                className="rounded-md border px-2.5 py-0.5 text-xs font-bold disabled:opacity-30"
              >
                A–
              </button>
              <button
                onClick={increase}
                disabled={!canIncrease}
                className="rounded-md border px-2.5 py-0.5 text-sm font-bold disabled:opacity-30"
              >
                A+
              </button>
            </div>
          </div>
        </nav>
      </div>
    </header>
  )
}
