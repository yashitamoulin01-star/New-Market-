import Image from "next/image"
import Link from "next/link"
import { getActiveAdsByPosition, type AdPosition } from "@/lib/supabase/ads"

interface Props {
  position: AdPosition
  className?: string
}

export async function AdBanner({ position, className = "" }: Props) {
  let ads: Awaited<ReturnType<typeof getActiveAdsByPosition>> = []
  try {
    ads = await getActiveAdsByPosition(position)
  } catch {
    return null
  }

  if (ads.length === 0) return null

  const ad = ads[0]

  const isVertical = position === "left" || position === "right"

  const inner = (
    <div className={`overflow-hidden rounded-lg border bg-card shadow-sm ${isVertical ? "w-36 lg:w-40" : "w-full"} ${className}`}>
      <div className={`relative ${isVertical ? "h-64 lg:h-80 w-full" : "h-20 sm:h-24 w-full"}`}>
        <Image
          src={ad.image_url}
          alt={ad.title ?? "Advertisement"}
          fill
          className="object-cover"
          sizes={isVertical ? "160px" : "100vw"}
        />
      </div>
      {ad.title && (
        <p className="px-2 py-1 text-center text-[10px] text-muted-foreground">AD</p>
      )}
    </div>
  )

  return ad.link_url ? (
    <Link href={ad.link_url} target="_blank" rel="noopener noreferrer sponsored">
      {inner}
    </Link>
  ) : (
    inner
  )
}
