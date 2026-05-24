"use server"

import { revalidatePath } from "next/cache"
import { adminCreateAd, adminUpdateAd, adminDeleteAd, adminToggleAd, type AdPosition } from "@/lib/supabase/ads"

export async function createAdAction(formData: FormData) {
  const position  = formData.get("position") as AdPosition
  const image_url = (formData.get("image_url") as string).trim()
  const link_url  = (formData.get("link_url") as string | null)?.trim() || null
  const title     = (formData.get("title") as string | null)?.trim() || null
  const display_order = Number(formData.get("display_order") ?? 0)

  if (!position || !image_url) return

  await adminCreateAd({ position, image_url, link_url, title, is_active: false, display_order })
  revalidatePath("/admin/ads")
  revalidatePath("/")
}

export async function updateAdAction(id: string, formData: FormData) {
  const image_url = (formData.get("image_url") as string).trim()
  const link_url  = (formData.get("link_url") as string | null)?.trim() || null
  const title     = (formData.get("title") as string | null)?.trim() || null
  const display_order = Number(formData.get("display_order") ?? 0)

  await adminUpdateAd(id, { image_url, link_url, title, display_order })
  revalidatePath("/admin/ads")
  revalidatePath("/")
}

export async function toggleAdAction(id: string, is_active: boolean) {
  await adminToggleAd(id, is_active)
  revalidatePath("/admin/ads")
  revalidatePath("/")
}

export async function deleteAdAction(id: string) {
  await adminDeleteAd(id)
  revalidatePath("/admin/ads")
  revalidatePath("/")
}
