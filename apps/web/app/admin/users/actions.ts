"use server"

import { adminBanUser, adminUnbanUser, adminSetRole } from "@/lib/supabase/users"
import type { UserRole } from "@/lib/supabase/users-defs"
import { revalidatePath } from "next/cache"

export async function banUserAction(id: string, formData: FormData) {
  const reason = (formData.get("reason") as string)?.trim() || "Violation of community guidelines"
  await adminBanUser(id, reason)
  revalidatePath("/admin/users")
}

export async function unbanUserAction(id: string) {
  await adminUnbanUser(id)
  revalidatePath("/admin/users")
}

export async function setRoleAction(id: string, formData: FormData) {
  const role = formData.get("role") as UserRole
  if (!role) return
  await adminSetRole(id, role)
  revalidatePath("/admin/users")
}
