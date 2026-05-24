"use client"

import Link from "next/link"
import Image from "next/image"
import { MapPin, Maximize2, Eye, Sofa } from "lucide-react"
import {
  type PropertyCardData,
  PROPERTY_TYPE_LABELS_BI,
  LISTING_TYPE_LABELS_BI,
  formatPrice,
} from "@/lib/supabase/property-defs"
import { useLanguage } from "@/contexts/language-context"
import type { Lang } from "@/lib/i18n"

const LISTING_TYPE_COLORS: Record<string, string> = {
  RENT:  "bg-blue-600 text-white",
  SALE:  "bg-emerald-600 text-white",
  LEASE: "bg-violet-600 text-white",
}

const PROPERTY_TYPE_COLORS: Record<string, string> = {
  SHOP:      "bg-orange-100 text-orange-800",
  OFFICE:    "bg-sky-100 text-sky-800",
  WAREHOUSE: "bg-yellow-100 text-yellow-800",
  SHOWROOM:  "bg-pink-100 text-pink-800",
  KIOSK:     "bg-teal-100 text-teal-800",
  OTHER:     "bg-slate-100 text-slate-700",
}

function timeAgo(iso: string, lang: Lang) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  if (lang === "hi") {
    if (days === 0) return "आज"
    if (days === 1) return "कल"
    if (days < 7)  return `${days} दिन पहले`
    if (days < 30) return `${Math.floor(days / 7)} सप्ताह पहले`
    return new Date(iso).toLocaleDateString("hi-IN", { day: "numeric", month: "short" })
  }
  if (days === 0) return "Today"
  if (days === 1) return "Yesterday"
  if (days < 7)  return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
}

export function PropertyCard({ property }: { property: PropertyCardData }) {
  const { lang } = useLanguage()
  const listingColor  = LISTING_TYPE_COLORS[property.listing_type] ?? "bg-slate-600 text-white"
  const propertyColor = PROPERTY_TYPE_COLORS[property.property_type] ?? PROPERTY_TYPE_COLORS.OTHER
  const price         = formatPrice(property.price, property.price_label, property.listing_type)
  const coverImage    = property.images?.[0]
  const listingLabel  = LISTING_TYPE_LABELS_BI[property.listing_type]?.[lang] ?? property.listing_type
  const propLabel     = PROPERTY_TYPE_LABELS_BI[property.property_type]?.[lang] ?? property.property_type

  return (
    <Link
      href={`/property/${property.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
    >
      {coverImage ? (
        <div className="relative h-44 w-full overflow-hidden">
          <Image
            src={coverImage}
            alt={property.title}
            fill
            className="object-cover group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <span className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-bold shadow ${listingColor}`}>
            {listingLabel}
          </span>
          {property.is_featured && (
            <span className="absolute right-3 top-3 rounded-full bg-amber-400 px-2.5 py-0.5 text-xs font-bold text-amber-900 shadow">
              {lang === "hi" ? "फ़ीचर्ड" : "Featured"}
            </span>
          )}
        </div>
      ) : (
        <div className="relative flex h-28 w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
          <span className="text-3xl font-extrabold text-muted-foreground/20">
            {propLabel.charAt(0)}
          </span>
          <span className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-bold ${listingColor}`}>
            {listingLabel}
          </span>
          {property.is_featured && (
            <span className="absolute right-3 top-3 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
              {lang === "hi" ? "फ़ीचर्ड" : "Featured"}
            </span>
          )}
        </div>
      )}

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${propertyColor}`}>
            {propLabel}
          </span>
        </div>

        <h2 className="mb-1 line-clamp-2 font-heading text-[15px] font-semibold leading-snug text-card-foreground transition-colors group-hover:text-primary">
          {property.title}
        </h2>

        <div className="mb-2 flex items-start gap-1 text-xs text-muted-foreground">
          <MapPin size={11} className="mt-0.5 shrink-0" />
          <span className="line-clamp-1">{property.address}</span>
        </div>

        <div className="mb-3 flex items-center gap-3 text-xs text-muted-foreground">
          {property.area_sqft && (
            <span className="flex items-center gap-1">
              <Maximize2 size={11} />
              {property.area_sqft.toLocaleString()} {lang === "hi" ? "वर्ग फ़ीट" : "sq ft"}
            </span>
          )}
          {property.floor && <span>{property.floor}</span>}
          {property.is_furnished && (
            <span className="flex items-center gap-1 text-emerald-700">
              <Sofa size={11} />
              {lang === "hi" ? "फर्निश्ड" : "Furnished"}
            </span>
          )}
        </div>

        <div className="mb-3 text-base font-bold text-foreground">{price}</div>

        {property.amenities.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {property.amenities.slice(0, 3).map((a) => (
              <span key={a} className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                {a}
              </span>
            ))}
            {property.amenities.length > 3 && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                +{property.amenities.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
          <span>{timeAgo(property.created_at, lang)}</span>
          <span className="flex items-center gap-1">
            <Eye size={11} />
            {property.view_count.toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  )
}
