"use client"

import Link from "next/link"
import { MapPin, Phone, Clock, BadgeCheck, Eye } from "lucide-react"
import { type ShopCardData } from "@/lib/supabase/shops-defs"
import { SafeImage } from "@/components/ui/safe-image"
import { useLanguage } from "@/contexts/language-context"

export function ShopCard({ shop }: { shop: ShopCardData }) {
  const { lang } = useLanguage()

  return (
    <Link
      href={`/shops/${shop.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
    >
      {shop.cover_image_url ? (
        <div className="relative h-36 w-full overflow-hidden">
          <SafeImage
            src={shop.cover_image_url}
            alt={shop.name}
            fill
            className="object-cover group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      ) : (
        <div className="h-1.5 w-full bg-primary" />
      )}

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-start gap-3">
          {shop.logo_url ? (
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border bg-muted">
              <SafeImage src={shop.logo_url} alt={shop.name} fill className="object-contain p-0.5" />
            </div>
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-lg font-bold text-primary">
              {shop.name.charAt(0)}
            </div>
          )}

          <div className="min-w-0 flex-1">
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
