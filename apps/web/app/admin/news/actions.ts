"use server"

import {
  moderateNews, adminDeleteNews,
  adminToggleNewsFlag, adminSetHomepageSlot,
  adminSetPriorityRank, adminSchedulePublish, adminEditNews,
  type HomepageSlot,
} from "@/lib/supabase/news"
import { revalidatePath } from "next/cache"

export async function approveNewsAction(id: string) {
  await moderateNews(id, "APPROVED")
  revalidatePath("/admin/news")
  revalidatePath("/news")
  revalidatePath("/")
}

export async function rejectNewsAction(id: string, formData: FormData) {
  const note = (formData.get("note") as string)?.trim()
  await moderateNews(id, "REJECTED", note || undefined)
  revalidatePath("/admin/news")
}

export async function deleteNewsAction(id: string) {
  await adminDeleteNews(id)
  revalidatePath("/admin/news")
  revalidatePath("/news")
  revalidatePath("/")
}

export async function toggleNewsFlagAction(
  id: string,
  field: "is_featured" | "is_breaking" | "is_pinned" | "is_trending",
  value: boolean
) {
  await adminToggleNewsFlag(id, field, value)
  revalidatePath("/admin/news")
  revalidatePath("/")
}

export async function setHomepageSlotAction(id: string, formData: FormData) {
  const slot = (formData.get("slot") as string) || null
  await adminSetHomepageSlot(id, slot as HomepageSlot | null)
  revalidatePath("/admin/news")
  revalidatePath("/")
}

export async function setPriorityRankAction(id: string, formData: FormData) {
  const rank = parseInt(formData.get("rank") as string, 10)
  if (!isNaN(rank)) {
    await adminSetPriorityRank(id, rank)
    revalidatePath("/admin/news")
    revalidatePath("/")
  }
}

export async function schedulePublishAction(id: string, formData: FormData) {
  const dt = (formData.get("datetime") as string) || null
  await adminSchedulePublish(id, dt)
  revalidatePath("/admin/news")
}

export async function editNewsAction(id: string, formData: FormData) {
  const patch = {
    title:           (formData.get("title") as string)?.trim() || undefined,
    excerpt:         (formData.get("excerpt") as string)?.trim() || undefined,
    content:         (formData.get("content") as string)?.trim() || undefined,
    cover_image_url: (formData.get("cover_image_url") as string)?.trim() || undefined,
  }
  await adminEditNews(id, patch)
  revalidatePath("/admin/news")
  revalidatePath("/news")
  revalidatePath("/")
}
