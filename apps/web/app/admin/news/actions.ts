"use server"

import { moderateNews, adminDeleteNews } from "@/lib/supabase/news"
import { revalidatePath } from "next/cache"

export async function approveNewsAction(id: string) {
  await moderateNews(id, "APPROVED")
  revalidatePath("/admin/news")
  revalidatePath("/news")
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
}
