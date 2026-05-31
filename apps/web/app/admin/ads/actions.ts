"use server"

import { adminCreateAd, adminUpdateAd, adminDeleteAd } from "@/lib/supabase/ads"
import type { AdSlot } from "@/lib/supabase/ads-defs"
import { revalidatePath, revalidateTag } from "next/cache"

export async function createAdAction(formData: FormData) {
  const title     = (formData.get("title") as string).trim()
  const image_url = (formData.get("image_url") as string).trim()
  const link_url  = (formData.get("link_url") as string)?.trim() || undefined
  const slot      = formData.get("slot") as AdSlot
  const priority  = parseInt(formData.get("priority") as string, 10) || 10
  const starts_at = (formData.get("starts_at") as string) || undefined
  const ends_at   = (formData.get("ends_at") as string) || undefined

  if (!title || !image_url || !slot) return

  await adminCreateAd({ title, image_url, link_url, slot, priority, starts_at, ends_at })
  revalidatePath("/admin/ads")
  revalidateTag("ads")
  revalidatePath("/")
}

export async function toggleAdActiveAction(id: string, isActive: boolean) {
  await adminUpdateAd(id, { is_active: isActive })
  revalidatePath("/admin/ads")
  revalidateTag("ads")
  revalidatePath("/")
}

export async function deleteAdAction(id: string) {
  await adminDeleteAd(id)
  revalidatePath("/admin/ads")
  revalidateTag("ads")
  revalidatePath("/")
}

export async function editAdAction(id: string, formData: FormData) {
  const title     = (formData.get("title") as string)?.trim() || undefined
  const image_url = (formData.get("image_url") as string)?.trim() || undefined
  const link_url  = (formData.get("link_url") as string)?.trim() || null
  const slot      = (formData.get("slot") as AdSlot) || undefined
  const priority  = parseInt(formData.get("priority") as string, 10) || undefined
  const starts_at = (formData.get("starts_at") as string) || null
  const ends_at   = (formData.get("ends_at") as string) || null

  await adminUpdateAd(id, {
    ...(title     ? { title }     : {}),
    ...(image_url ? { image_url } : {}),
    link_url,
    ...(slot     ? { slot }     : {}),
    ...(priority ? { priority } : {}),
    starts_at,
    ends_at,
  })
  revalidatePath("/admin/ads")
  revalidateTag("ads")
  revalidatePath("/")
}
