"use server"

import { revalidateTag } from "next/cache"
import { setSiteSetting } from "@/lib/supabase/site-settings"

export async function updateYouTubeUrlAction(formData: FormData) {
  const url = String(formData.get("youtube_url") ?? "").trim() || null
  await setSiteSetting("youtube_video_url", url)
  revalidateTag("site-settings")
}

export async function updateSiteNoticeAction(formData: FormData) {
  const notice = String(formData.get("site_notice") ?? "").trim() || null
  await setSiteSetting("site_notice", notice)
  revalidateTag("site-settings")
}

export async function updateTickerEnabledAction(formData: FormData) {
  const enabled = formData.get("ticker_enabled") === "true" ? "true" : "false"
  await setSiteSetting("ticker_enabled", enabled)
  revalidateTag("site-settings")
}
