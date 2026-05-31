"use server"

import { revalidatePath } from "next/cache"
import { moderateProperty, adminDeleteProperty, adminUpdateProperty, restoreProperty } from "@/lib/supabase/property"

export async function approvePropertyAction(id: string) {
  await moderateProperty(id, "APPROVED")
  revalidatePath("/admin/property")
  revalidatePath("/property")
}

export async function rejectPropertyAction(id: string, formData: FormData) {
  const note = String(formData.get("rejection_note") ?? "").trim() || undefined
  await moderateProperty(id, "REJECTED", note)
  revalidatePath("/admin/property")
}

export async function restorePropertyAction(id: string) {
  await restoreProperty(id)
  revalidatePath("/admin/property")
}

export async function editPropertyAction(id: string, formData: FormData) {
  const area = formData.get("area_sqft")
  const price = formData.get("price")
  await adminUpdateProperty(id, {
    title:         String(formData.get("title")         ?? "").trim() || undefined,
    description:   String(formData.get("description")   ?? "").trim() || undefined,
    address:       String(formData.get("address")       ?? "").trim() || undefined,
    floor:         String(formData.get("floor")         ?? "").trim() || undefined,
    price_label:   String(formData.get("price_label")   ?? "").trim() || undefined,
    contact_name:  String(formData.get("contact_name")  ?? "").trim() || undefined,
    contact_phone: String(formData.get("contact_phone") ?? "").trim() || undefined,
    contact_email: String(formData.get("contact_email") ?? "").trim() || undefined,
    area_sqft:     area  ? Number(area)  : undefined,
  })
  revalidatePath("/admin/property")
  revalidatePath("/property")
}

export async function featurePropertyAction(id: string, value: boolean) {
  await adminUpdateProperty(id, { is_featured: value })
  revalidatePath("/admin/property")
  revalidatePath("/property")
}

export async function deletePropertyAction(id: string) {
  await adminDeleteProperty(id)
  revalidatePath("/admin/property")
  revalidatePath("/property")
}
