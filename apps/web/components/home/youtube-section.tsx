import { getCachedSiteSetting } from "@/lib/data/cached"
import { Youtube } from "lucide-react"

function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )
  return match ? match[1] : null
}

export async function YouTubeSection() {
  let url: string | null = null
  try {
    url = await getCachedSiteSetting("youtube_video_url")
  } catch {
    return null
  }

  if (!url) return null

  const videoId = extractYouTubeId(url)
  if (!videoId) return null

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-2.5">
        <Youtube size={13} className="text-red-500" />
        <span className="text-sm font-bold">Watch</span>
      </div>
      <div className="relative aspect-video w-full">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
          title="Featured Video"
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  )
}
