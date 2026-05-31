"use server"

import { revalidatePath } from "next/cache"
import { moderateJob, adminDeleteJob, adminUpdateJob, restoreJob } from "@/lib/supabase/jobs"

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

export async function restoreJobAction(id: string) {
  await restoreJob(id)
  revalidatePath("/admin/jobs")
}

export async function editJobAction(id: string, formData: FormData) {
  await adminUpdateJob(id, {
    title:         String(formData.get("title") ?? "").trim() || undefined,
    description:   String(formData.get("description") ?? "").trim() || undefined,
    requirements:  String(formData.get("requirements") ?? "").trim() || undefined,
    benefits:      String(formData.get("benefits") ?? "").trim() || undefined,
    shop_name:     String(formData.get("shop_name") ?? "").trim() || undefined,
    shop_address:  String(formData.get("shop_address") ?? "").trim() || undefined,
    contact_name:  String(formData.get("contact_name") ?? "").trim() || undefined,
    contact_email: String(formData.get("contact_email") ?? "").trim() || undefined,
    contact_phone: String(formData.get("contact_phone") ?? "").trim() || undefined,
    salary_label:  String(formData.get("salary_label") ?? "").trim() || undefined,
    timing:        String(formData.get("timing") ?? "").trim() || undefined,
  })
  revalidatePath("/admin/jobs")
  revalidatePath("/jobs")
}

export async function featureJobAction(id: string, value: boolean) {
  await adminUpdateJob(id, { is_featured: value })
  revalidatePath("/admin/jobs")
  revalidatePath("/jobs")
}

export async function deleteJobAction(id: string) {
  await adminDeleteJob(id)
  revalidatePath("/admin/jobs")
  revalidatePath("/jobs")
}
