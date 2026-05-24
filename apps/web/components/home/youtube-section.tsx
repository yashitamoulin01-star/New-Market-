import { getCachedSiteSetting } from "@/lib/data/cached"
import { Youtube } from "lucide-react"

function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )
  return match ? match[1] : null
}

// Fallback demo video shown when no URL is configured in DB yet
const DEMO_VIDEO_ID = "dQw4w9WgXcQ"

export async function YouTubeSection() {
  let urlString: string | null = null
  try {
    urlString = await getCachedSiteSetting("youtube_video_url")
  } catch {
    // DB not set up yet
  }

  if (!urlString) {
    urlString = `https://www.youtube.com/watch?v=${DEMO_VIDEO_ID}`
  }

  const urls = urlString.split(",").map(u => u.trim()).filter(Boolean)
  const videoIds = urls.map(extractYouTubeId).filter(Boolean) as string[]
  
  if (videoIds.length === 0) return null

  const mainVideoId = videoIds[0]
  const playlist = videoIds.join(",")
  const src = `https://www.youtube.com/embed/${mainVideoId}?rel=0&modestbranding=1&autoplay=1&mute=1&loop=1&playlist=${playlist}`

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-2.5">
        <Youtube size={13} className="text-red-500" />
        <span className="text-sm font-bold">Watch</span>
      </div>
      <div className="relative aspect-video w-full">
        <iframe
          src={src}
          title="Featured Videos"
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  )
}
