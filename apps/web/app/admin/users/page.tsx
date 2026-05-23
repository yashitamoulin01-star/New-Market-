import Link from "next/link"
import type { Metadata } from "next"
import { Users, ShieldBan, ShieldCheck, Crown } from "lucide-react"
import { adminListUsers } from "@/lib/supabase/users"
import { ROLE_LABELS } from "@/lib/supabase/users-defs"
import type { UserRole } from "@/lib/supabase/users-defs"
import { banUserAction, unbanUserAction, setRoleAction } from "./actions"

export const metadata: Metadata = { title: "Newsroom — Users" }

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; role?: string }>
}) {
  const { page, role } = await searchParams
  const currentPage = Math.max(1, Number(page) || 1)
  const roleFilter  = role as UserRole | undefined

  const { items, total, totalPages } = await adminListUsers({
    page: currentPage,
    role: roleFilter,
  })

  const ROLE_TABS: { label: string; value: UserRole | "" }[] = [
    { label: "All Users",  value: "" },
    { label: "Admins",     value: "admin" },
    { label: "Moderators", value: "moderator" },
    { label: "Users",      value: "user" },
  ]

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold">User Management</h1>
        <p className="text-sm text-muted-foreground">
          {total} registered user{total !== 1 ? "s" : ""} · Manage roles and bans
        </p>
      </div>

      {/* Role tabs */}
      <div className="mb-6 flex gap-1 border-b">
        {ROLE_TABS.map((tab) => {
          const active = (tab.value === "" && !role) || tab.value === role
          const href = tab.value ? `/admin/users?role=${tab.value}` : "/admin/users"
          return (
            <Link
              key={tab.value}
              href={href}
              className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>

      {/* User list */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
          <Users size={36} className="mb-3 text-muted-foreground/30" />
          <p className="font-medium text-muted-foreground">No users found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((user) => {
            const roleConfig = ROLE_LABELS[user.role]
            return (
              <div
                key={user.id}
                className={`rounded-xl border bg-card p-4 shadow-sm ${user.is_banned ? "border-red-200 bg-red-50/30" : ""}`}
              >
                <div className="flex flex-wrap items-start gap-3">
                  {/* Avatar */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {(user.display_name ?? user.email ?? "?").charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-sm">
                        {user.display_name ?? "—"}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${roleConfig.color}`}>
                        {roleConfig.label}
                      </span>
                      {user.is_banned && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                          BANNED
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{user.email ?? "No email"}</p>
                    <p className="text-xs text-muted-foreground">
                      Joined {formatDate(user.created_at)}
                      {user.is_banned && user.ban_reason && (
                        <span className="ml-2 text-red-600">· {user.ban_reason}</span>
                      )}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {/* Role selector */}
                    <form action={setRoleAction.bind(null, user.id)} className="flex items-center gap-1">
                      <select
                        name="role"
                        defaultValue={user.role}
                        className="rounded-lg border bg-background px-2 py-1 text-xs outline-none focus:border-primary"
                      >
                        <option value="user">User</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button type="submit" className="rounded-lg bg-muted px-2 py-1 text-xs font-semibold hover:bg-muted/80 transition">
                        <Crown size={11} />
                      </button>
                    </form>

                    {/* Ban / Unban */}
                    {user.is_banned ? (
                      <form action={unbanUserAction.bind(null, user.id)}>
                        <button
                          type="submit"
                          className="flex items-center gap-1 rounded-lg bg-green-50 border border-green-200 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 transition"
                        >
                          <ShieldCheck size={11} /> Unban
                        </button>
                      </form>
                    ) : (
                      <form action={banUserAction.bind(null, user.id)} className="flex items-center gap-1">
                        <input
                          name="reason"
                          placeholder="Ban reason"
                          className="rounded-lg border bg-background px-2 py-1 text-xs outline-none focus:border-primary w-32"
                        />
                        <button
                          type="submit"
                          className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition"
                        >
                          <ShieldBan size={11} /> Ban
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          {currentPage > 1 && (
            <Link
              href={`/admin/users?page=${currentPage - 1}${roleFilter ? `&role=${roleFilter}` : ""}`}
              className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted"
            >
              Previous
            </Link>
          )}
          <span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</span>
          {currentPage < totalPages && (
            <Link
              href={`/admin/users?page=${currentPage + 1}${roleFilter ? `&role=${roleFilter}` : ""}`}
              className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
