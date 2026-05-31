"use server"

import { revalidatePath } from "next/cache"
import { moderateShop, adminToggleVerified, adminDeleteShop, adminUpdateShop, restoreShop } from "@/lib/supabase/shops"

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

export async function restoreShopAction(id: string) {
  await restoreShop(id)
  revalidatePath("/admin/shops")
}

export async function editShopAction(id: string, formData: FormData) {
  await adminUpdateShop(id, {
    name:          String(formData.get("name")          ?? "").trim() || undefined,
    description:   String(formData.get("description")   ?? "").trim() || undefined,
    address:       String(formData.get("address")       ?? "").trim() || undefined,
    phone:         String(formData.get("phone")         ?? "").trim() || undefined,
    email:         String(formData.get("email")         ?? "").trim() || undefined,
    website:       String(formData.get("website")       ?? "").trim() || undefined,
    opening_hours: String(formData.get("opening_hours") ?? "").trim() || undefined,
  })
  revalidatePath("/admin/shops")
  revalidatePath("/shops")
}

export async function featureShopAction(id: string, value: boolean) {
  await adminUpdateShop(id, { is_featured: value })
  revalidatePath("/admin/shops")
  revalidatePath("/shops")
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
