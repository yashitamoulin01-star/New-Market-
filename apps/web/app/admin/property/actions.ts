"use server"

import { revalidatePath } from "next/cache"
import { moderateProperty, adminDeleteProperty } from "@/lib/supabase/property"

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

export async function deletePropertyAction(id: string) {
  await adminDeleteProperty(id)
  revalidatePath("/admin/property")
  revalidatePath("/property")
}
