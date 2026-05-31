"use server"

import { submitJob, type SubmitJobInput, type JobType, type ApplicationMode } from "@/lib/supabase/jobs"

export interface PostJobState {
  success: boolean
  error?: string
  job?: { id: string; title: string }
}

function strip(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim()
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function safeNumber(v: FormDataEntryValue | null | undefined): number | undefined {
  if (!v) return undefined
  const n = Number(v)
  return isFinite(n) && n >= 0 ? n : undefined
}

export async function postJobAction(
  _prev: PostJobState,
  formData: FormData
): Promise<PostJobState> {
  const raw = Object.fromEntries(formData.entries())

  const input: SubmitJobInput = {
    title:            strip(String(raw.title || "")),
    description:      strip(String(raw.description || "")),
    requirements:     strip(String(raw.requirements || "")) || undefined,
    benefits:         strip(String(raw.benefits || "")) || undefined,
    job_type:         raw.job_type as JobType,
    category:         "OTHER",
    shop_name:        strip(String(raw.shop_name || "")),
    shop_address:     strip(String(raw.shop_address || "")) || undefined,
    salary_min:       safeNumber(raw.salary_min),
    salary_max:       safeNumber(raw.salary_max),
    salary_label:     strip(String(raw.salary_label || "")) || undefined,
    application_mode: raw.application_mode as ApplicationMode,
    application_link: String(raw.application_link || "").trim() || undefined,
    contact_name:     strip(String(raw.contact_name || "")),
    contact_email:    String(raw.contact_email || "").trim().toLowerCase(),
    contact_phone:    String(raw.contact_phone || "").trim() || undefined,
    openings:         safeNumber(raw.openings) ?? 1,
    experience_years: safeNumber(raw.experience_years),
    timing:           strip(String(raw.timing || "")) || undefined,
  }

  if (!input.title) return { success: false, error: "Job title is required." }
  if (!input.description) return { success: false, error: "Job description is required." }
  if (!input.job_type) return { success: false, error: "Job type is required." }
  if (!input.shop_name) return { success: false, error: "Shop / business name is required." }
  if (!input.application_mode) return { success: false, error: "Application mode is required." }
  if (!input.contact_name) return { success: false, error: "Contact name is required." }
  if (!input.contact_email) return { success: false, error: "Contact email is required." }
  if (!isValidEmail(input.contact_email)) return { success: false, error: "Please enter a valid email address." }
  if (input.salary_min != null && input.salary_max != null && input.salary_min > input.salary_max)
    return { success: false, error: "Minimum salary cannot exceed maximum salary." }

  try {
    const job = await submitJob(input)
    return { success: true, job }
  } catch {
    return { success: false, error: "Submission failed. Please try again." }
  }
}
