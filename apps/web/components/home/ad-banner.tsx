import Image from "next/image"
import { getCachedAds } from "@/lib/data/cached"
import type { AdSlot } from "@/lib/supabase/ads-defs"

interface Props {
  slot: AdSlot
  size?: "leaderboard" | "rectangle" | "strip"
  className?: string
}

const DIMS = {
  leaderboard: "h-20 sm:h-24",
  rectangle:   "h-48 sm:h-60",
  strip:       "h-12",
}

export async function AdBanner({ slot, size = "leaderboard", className = "" }: Props) {
  let ads: Awaited<ReturnType<typeof getCachedAds>> = []
  try {
    ads = await getCachedAds(slot)
  } catch {
    // table may not exist yet — fall through to placeholder
  }

  const ad = ads[0]

  if (ad) {
    return (
      <div className={`relative overflow-hidden border-y ${DIMS[size]} ${className}`} data-ad-slot={slot}>
        <a
          href={ad.link_url ?? "#"}
          target={ad.link_url ? "_blank" : undefined}
          rel="noopener sponsored"
          className="relative block h-full w-full"
        >
          <Image
            src={ad.image_url}
            alt={ad.title}
            fill
            className="object-cover"
            sizes="100vw"
          />
        </a>
        <span className="pointer-events-none absolute bottom-1 right-2 rounded bg-black/30 px-1 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-white/70">
          Ad
        </span>
      </div>
    )
  }

  // Placeholder when no active ad
  return (
    <div
      className={`flex items-center justify-center border-y bg-gradient-to-r from-amber-50 via-white to-amber-50 ${DIMS[size]} ${className}`}
      data-ad-slot={slot}
    >
      <div className="flex flex-col items-center gap-0.5 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-600/60">
          Advertisement
        </p>
        <p className="text-xs text-muted-foreground/50">
          Advertise here — contact@newmarket.co.in
        </p>
      </div>
    </div>
  )
}
