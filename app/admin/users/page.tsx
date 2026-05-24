import { Users, ShieldCheck, ShieldOff, Trash2 } from "lucide-react"
import { createAdminClient } from "@/lib/supabase/admin-client"
import { banUserAction, unbanUserAction, deleteUserAction } from "./actions"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Admin — Users" }

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  })
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageStr } = await searchParams
  const page = Math.max(1, Number(pageStr ?? 1))
  const perPage = 20

  const admin = createAdminClient()
  const { data, error } = await admin.auth.admin.listUsers({ page, perPage })

  if (error) {
    return (
      <div className="container py-8">
        <p className="text-destructive text-sm">Error loading users: {error.message}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Make sure SUPABASE_SERVICE_ROLE_KEY is set in your environment.
        </p>
      </div>
    )
  }

  const users = data.users ?? []
  const total = (data as { total?: number }).total ?? users.length

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={20} className="text-primary" />
          <h1 className="font-heading text-2xl font-bold">User Management</h1>
        </div>
        <p className="text-sm text-muted-foreground">{total} registered user{total !== 1 ? "s" : ""}</p>
      </div>

      {users.length === 0 ? (
        <div className="rounded-xl border border-dashed py-14 text-center text-muted-foreground">
          No users found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Joined</th>
                <th className="px-4 py-3 text-left">Last Sign-in</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y bg-card">
              {users.map((user) => {
                const isBanned = !!user.banned_until && new Date(user.banned_until) > new Date()
                const isAdmin = user.user_metadata?.role === "admin"

                return (
                  <tr key={user.id} className="hover:bg-muted/20 transition">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "—"}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(user.created_at)}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : "Never"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                        isBanned
                          ? "bg-red-100 text-red-800"
                          : user.email_confirmed_at
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}>
                        {isBanned ? "Banned" : user.email_confirmed_at ? "Active" : "Unverified"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${isAdmin ? "text-primary" : "text-muted-foreground"}`}>
                        {isAdmin ? "Admin" : "User"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {!isAdmin && (
                          <>
                            {isBanned ? (
                              <form action={unbanUserAction.bind(null, user.id)}>
                                <button
                                  type="submit"
                                  title="Unban"
                                  className="flex items-center gap-1 rounded-lg border border-emerald-200 px-2.5 py-1 text-xs text-emerald-700 hover:bg-emerald-50 transition"
                                >
                                  <ShieldCheck size={11} /> Unban
                                </button>
                              </form>
                            ) : (
                              <form action={banUserAction.bind(null, user.id)}>
                                <button
                                  type="submit"
                                  title="Ban user"
                                  className="flex items-center gap-1 rounded-lg border border-amber-200 px-2.5 py-1 text-xs text-amber-700 hover:bg-amber-50 transition"
                                >
                                  <ShieldOff size={11} /> Ban
                                </button>
                              </form>
                            )}

                            <form action={deleteUserAction.bind(null, user.id)}>
                              <button
                                type="submit"
                                title="Delete user"
                                className="flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 transition"
                              >
                                <Trash2 size={11} /> Delete
                              </button>
                            </form>
                          </>
                        )}
                        {isAdmin && (
                          <span className="text-xs text-muted-foreground italic">Protected</span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-center gap-3">
        {page > 1 && (
          <a href={`/admin/users?page=${page - 1}`} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted transition">
            Previous
          </a>
        )}
        <span className="text-sm text-muted-foreground">Page {page}</span>
        {users.length === perPage && (
          <a href={`/admin/users?page=${page + 1}`} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted transition">
            Next
          </a>
        )}
      </div>
    </div>
  )
}
