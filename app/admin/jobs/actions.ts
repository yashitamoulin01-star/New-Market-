"use server"

import { revalidatePath } from "next/cache"
import { moderateJob, adminDeleteJob } from "@/lib/supabase/jobs"

export async function approveJobAction(id: string) {
  await moderateJob(id, "APPROVED")
  revalidatePath("/admin/jobs")
  revalidatePath("/jobs")
}

export async function rejectJobAction(id: string, formData: FormData) {
  const note = String(formData.get("rejection_note") ?? "").trim() || undefined
  await moderateJob(id, "REJECTED", note)
  revalidatePath("/admin/jobs")
}

export async function deleteJobAction(id: string) {
  await adminDeleteJob(id)
  revalidatePath("/admin/jobs")
  revalidatePath("/jobs")
}
