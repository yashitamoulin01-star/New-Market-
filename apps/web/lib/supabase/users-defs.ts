// Client-safe types and labels for user profiles. No server imports.

export type UserRole = "user" | "moderator" | "admin"

export interface UserProfile {
  id: string
  email: string | null
  display_name: string | null
  role: UserRole
  is_banned: boolean
  ban_reason: string | null
  banned_at: string | null
  created_at: string
  updated_at: string
}

export const ROLE_LABELS: Record<UserRole, { label: string; color: string }> = {
  user:      { label: "User",      color: "bg-slate-100 text-slate-700" },
  moderator: { label: "Moderator", color: "bg-blue-100 text-blue-800" },
  admin:     { label: "Admin",     color: "bg-primary/10 text-primary" },
}
