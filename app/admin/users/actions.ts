"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin-client"

export async function banUserAction(userId: string) {
  const admin = createAdminClient()
  const { error } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: "87600h",
  })
  if (error) throw error
  revalidatePath("/admin/users")
}

export async function unbanUserAction(userId: string) {
  const admin = createAdminClient()
  const { error } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: "none",
  })
  if (error) throw error
  revalidatePath("/admin/users")
}

export async function deleteUserAction(userId: string) {
  const admin = createAdminClient()
  const { error } = await admin.auth.admin.deleteUser(userId)
  if (error) throw error
  revalidatePath("/admin/users")
}
