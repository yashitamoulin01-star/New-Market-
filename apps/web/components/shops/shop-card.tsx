"use client"

import Link from "next/link"
import Image from "next/image"
import { MapPin, Phone, Clock, BadgeCheck, Eye } from "lucide-react"
import { type ShopCardData, SHOP_CATEGORY_LABELS_BI } from "@/lib/supabase/shops-defs"
import { useLanguage } from "@/contexts/language-context"

const CATEGORY_COLORS: Record<string, { chip: string; bar: string }> = {
  CLOTHING:           { chip: "bg-pink-500/15 text-pink-700 dark:text-pink-400",       bar: "bg-pink-400" },
  FOOD_BEVERAGE:      { chip: "bg-orange-500/15 text-orange-700 dark:text-orange-400", bar: "bg-orange-400" },
  ELECTRONICS:        { chip: "bg-sky-500/15 text-sky-700 dark:text-sky-400",          bar: "bg-sky-400" },
  BEAUTY_WELLNESS:    { chip: "bg-rose-500/15 text-rose-700 dark:text-rose-400",       bar: "bg-rose-400" },
  TAILORING:          { chip: "bg-purple-500/15 text-purple-700 dark:text-purple-400", bar: "bg-purple-400" },
  JEWELRY:            { chip: "bg-amber-500/15 text-amber-700 dark:text-amber-400",    bar: "bg-amber-400" },
  PHARMACY:           { chip: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400", bar: "bg-emerald-400" },
  BOOKS_STATIONERY:   { chip: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-400", bar: "bg-indigo-400" },
  FOOTWEAR:           { chip: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400", bar: "bg-yellow-600" },
  HANDICRAFTS:        { chip: "bg-lime-500/15 text-lime-700 dark:text-lime-400",       bar: "bg-lime-400" },
  MOBILE_ACCESSORIES: { chip: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-400",       bar: "bg-cyan-400" },
  OPTICALS:           { chip: "bg-teal-500/15 text-teal-700 dark:text-teal-400",       bar: "bg-teal-400" },
  OTHER:              { chip: "bg-slate-500/15 text-slate-700 dark:text-slate-400",    bar: "bg-slate-400" },
}

export function ShopCard({ shop }: { shop: ShopCardData }) {
  const { lang } = useLanguage()
  const style    = CATEGORY_COLORS[shop.category] ?? CATEGORY_COLORS.OTHER
  const catLabel = SHOP_CATEGORY_LABELS_BI[shop.category]?.[lang] ?? shop.category

  return (
    <Link
      href={`/shops/${shop.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
    >
      {shop.cover_image_url ? (
        <div className="relative h-36 w-full overflow-hidden">
          <Image
            src={shop.cover_image_url}
            alt={shop.name}
            fill
            className="object-cover group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <span className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm backdrop-blur-sm ${style.chip}`}>
            {catLabel}
          </span>
        </div>
      ) : (
        <div className={`h-1.5 w-full ${style.bar}`} />
      )}

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-start gap-3">
          {shop.logo_url ? (
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border bg-muted">
              <Image src={shop.logo_url} alt={shop.name} fill className="object-contain p-0.5" />
            </div>
          ) : (
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg font-bold ${style.chip}`}>
              {shop.name.charAt(0)}
            </div>
          )}

          <div className="min-w-0 flex-1">
            {!shop.cover_image_url && (
              <span className={`mb-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${style.chip}`}>
                {catLabel}
              </span>
            )}
            <h2 className="line-clamp-1 font-heading text-[15px] font-semibold leading-snug text-card-foreground transition-colors group-hover:text-primary">
              {shop.name}
            </h2>
          </div>

          {shop.is_verified && (
            <BadgeCheck
              size={16}
              className="mt-0.5 shrink-0 text-primary"
              aria-label={lang === "hi" ? "सत्यापित" : "Verified"}
            />
          )}
        </div>

        <div className="mb-1 flex items-start gap-1 text-xs text-muted-foreground">
          <MapPin size={11} className="mt-0.5 shrink-0" />
          <span className="line-clamp-1">{shop.address}</span>
        </div>

        {shop.opening_hours && (
          <div className="mb-2 flex items-center gap-1 text-xs text-muted-foreground">
            <Clock size={11} className="shrink-0" />
            <span className="line-clamp-1">{shop.opening_hours}</span>
          </div>
        )}

        {shop.tags.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {shop.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                {tag}
              </span>
            ))}
            {shop.tags.length > 3 && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                +{shop.tags.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
          {shop.phone ? (
            <span className="flex items-center gap-1">
              <Phone size={10} />
              {shop.phone}
            </span>
          ) : (
            <span />
          )}
          <span className="flex items-center gap-1">
            <Eye size={11} />
            {shop.view_count.toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  )
}
