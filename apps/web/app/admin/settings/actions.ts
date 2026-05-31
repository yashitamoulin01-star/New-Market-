"use server"

import { revalidateTag, revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { setSiteSetting } from "@/lib/supabase/site-settings"

function isValidYouTubeUrl(url: string): boolean {
  return /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/.test(url)
}

export async function updateYouTubeUrlAction(formData: FormData) {
  const url1 = String(formData.get("youtube_url_1") ?? "").trim()
  const url2 = String(formData.get("youtube_url_2") ?? "").trim()
  const url3 = String(formData.get("youtube_url_3") ?? "").trim()
  const all  = [url1, url2, url3]
  const valid = all.filter((u) => u && isValidYouTubeUrl(u))
  const hasInvalid = all.some((u) => u && !isValidYouTubeUrl(u))

  const finalUrl = valid.length > 0 ? valid.join(",") : null
  await setSiteSetting("youtube_video_url", finalUrl)
  revalidateTag("site-settings")
  revalidatePath("/admin/settings")
  revalidatePath("/")

  if (hasInvalid && valid.length === 0) {
    redirect("/admin/settings?error=invalid_youtube")
  }
  redirect("/admin/settings?saved=youtube")
}

export async function updateSiteNoticeAction(formData: FormData) {
  const notice = String(formData.get("site_notice") ?? "").trim() || null
  await setSiteSetting("site_notice", notice)
  revalidateTag("site-settings")
  redirect("/admin/settings?saved=notice")
}

export async function updateTickerEnabledAction(formData: FormData) {
  const enabled = formData.get("ticker_enabled") === "true" ? "true" : "false"
  await setSiteSetting("ticker_enabled", enabled)
  revalidateTag("site-settings")
  redirect("/admin/settings?saved=ticker")
}
