"use server"

import { revalidatePath } from "next/cache"
import { moderateShop, adminToggleVerified, adminDeleteShop } from "@/lib/supabase/shops"

export async function approveShopAction(id: string) {
  await moderateShop(id, "APPROVED")
  revalidatePath("/admin/shops")
  revalidatePath("/shops")
}

export async function rejectShopAction(id: string, formData: FormData) {
  const note = String(formData.get("rejection_note") ?? "").trim() || undefined
  await moderateShop(id, "REJECTED", note)
  revalidatePath("/admin/shops")
}

export async function verifyShopAction(id: string, formData: FormData) {
  const verified = formData.get("verified") === "true"
  await adminToggleVerified(id, verified)
  revalidatePath("/admin/shops")
  revalidatePath("/shops")
}

export async function deleteShopAction(id: string) {
  await adminDeleteShop(id)
  revalidatePath("/admin/shops")
  revalidatePath("/shops")
}
