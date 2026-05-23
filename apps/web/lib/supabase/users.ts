import { createClient } from "./server"
export * from "./users-defs"
import type { UserProfile, UserRole } from "./users-defs"

export async function adminListUsers(params: {
  page?: number
  limit?: number
  role?: UserRole
} = {}): Promise<{ items: UserProfile[]; total: number; page: number; limit: number; totalPages: number }> {
  const { page = 1, limit = 25, role } = params
  const from = (page - 1) * limit

  const supabase = await createClient()

  let query = supabase
    .from("user_profiles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1)

  if (role) query = query.eq("role", role)

  const { data, error, count } = await query
  if (error) throw error

  return {
    items: (data ?? []) as UserProfile[],
    total: count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit),
  }
}

export async function adminBanUser(id: string, reason: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("user_profiles")
    .update({
      is_banned: true,
      ban_reason: reason,
      banned_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) throw error
}

export async function adminUnbanUser(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("user_profiles")
    .update({
      is_banned: false,
      ban_reason: null,
      banned_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) throw error
}

export async function adminSetRole(id: string, role: UserRole) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("user_profiles")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) throw error
}
