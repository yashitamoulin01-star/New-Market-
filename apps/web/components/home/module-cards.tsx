"use client"

import Link from "next/link"
import { Store, Building2, Newspaper } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { translations as t } from "@/lib/i18n"

interface ModuleCardsProps {
  shopCount: number
  propertyCount: number
}

export function ModuleCards({ shopCount, propertyCount }: ModuleCardsProps) {
  const { lang } = useLanguage()

  const items = [
    {
      icon: Store,
      href: "/shops",
      label: t.modules.shops[lang],
      desc: t.modules.shopsDesc[lang],
      count: shopCount > 0 ? `${shopCount}+ ${t.modules.shopsCount[lang]}` : null,
      accent: "bg-green-50 border-green-200 group-hover:border-green-400",
      iconColor: "text-green-600",
    },
    {
      icon: Building2,
      href: "/property",
      label: t.modules.property[lang],
      desc: t.modules.propertyDesc[lang],
      count: propertyCount > 0 ? `${propertyCount}+ ${t.modules.propCount[lang]}` : null,
      accent: "bg-amber-50 border-amber-200 group-hover:border-amber-400",
      iconColor: "text-amber-600",
    },
    {
      icon: Newspaper,
      href: "/news/submit",
      label: t.modules.submitNews[lang],
      desc: t.modules.submitDesc[lang],
      count: null,
      accent: "bg-primary/5 border-primary/20 group-hover:border-primary/50",
      iconColor: "text-primary",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`group rounded-xl border p-5 transition-colors duration-150 ${item.accent}`}
        >
          <item.icon size={22} className={`mb-3 ${item.iconColor}`} />
          <h3 className="mb-1 font-semibold text-foreground">{item.label}</h3>
          <p className="text-sm text-muted-foreground">{item.desc}</p>
          {item.count && (
            <p className="mt-2 text-xs font-semibold text-muted-foreground">{item.count}</p>
          )}
        </Link>
      ))}
    </div>
  )
}
