import { createClient } from "./server"
export * from "./jobs-defs"
import type { JobType, JobCategory, ApplicationMode, ContentStatus, JobListing, JobCardData, SubmitJobInput } from "./jobs-defs"

// ── Public queries ─────────────────────────────────────────────────

export interface ListJobsParams {
  page?: number
  limit?: number
  category?: JobCategory
  jobType?: JobType
}

export async function listApprovedJobs(params: ListJobsParams = {}) {
  const { page = 1, limit = 12, category, jobType } = params
  const from = (page - 1) * limit

  const supabase = await createClient()

  let query = supabase
    .from("job_listings")
    .select(
      "id, title, job_type, category, shop_name, shop_address, salary_min, salary_max, salary_label, application_mode, openings, is_featured, view_count, created_at, expires_at",
      { count: "exact" }
    )
    .eq("status", "APPROVED")
    .or("expires_at.is.null,expires_at.gt." + new Date().toISOString())
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1)

  if (category) query = query.eq("category", category)
  if (jobType)  query = query.eq("job_type", jobType)

  const { data, error, count } = await query
  if (error) throw error

  return {
    items: (data ?? []) as JobCardData[],
    total: count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit),
  }
}

export async function getJobById(id: string): Promise<JobListing | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("job_listings")
    .select("*")
    .eq("id", id)
    .eq("status", "APPROVED")
    .single()

  if (error || !data) return null

  supabase.rpc("increment_job_view", { job_id: id }).then(() => {})

  return data as JobListing
}

// ── Public submit ──────────────────────────────────────────────────

export async function submitJob(input: SubmitJobInput) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("job_listings")
    .insert({ ...input, status: "APPROVED" })
    .select("id, title")
    .single()

  if (error) throw error
  return data
}

// ── Admin ──────────────────────────────────────────────────────────

export async function adminListJobs(params: {
  status?: ContentStatus
  page?: number
  limit?: number
} = {}) {
  const { status, page = 1, limit = 20 } = params
  const from = (page - 1) * limit

  const supabase = await createClient()

  let query = supabase
    .from("job_listings")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1)

  if (status) query = query.eq("status", status)

  const { data, error, count } = await query
  if (error) throw error

  return {
    items: (data ?? []) as JobListing[],
    total: count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit),
  }
}

export async function moderateJob(
  id: string,
  status: "APPROVED" | "REJECTED",
  rejectionNote?: string
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("job_listings")
    .update({
      status,
      reviewed_at: new Date().toISOString(),
      rejection_note: rejectionNote ?? null,
    })
    .eq("id", id)

  if (error) throw error
}

export async function adminDeleteJob(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("job_listings").delete().eq("id", id)
  if (error) throw error
}
