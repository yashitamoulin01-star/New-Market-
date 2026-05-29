import Link from "next/link"
import { BadgeCheck } from "lucide-react"
import {
  adminListShops,
  SHOP_CATEGORY_LABELS,
  type ContentStatus,
} from "@/lib/supabase/shops"
import {
  approveShopAction,
  rejectShopAction,
  verifyShopAction,
  deleteShopAction,
} from "./actions"

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>
}

export const metadata = { title: "Admin — Shops" }

const STATUS_TABS: { label: string; value: ContentStatus | "" }[] = [
  { label: "Pending",  value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "All",      value: "" },
]

const STATUS_COLORS: Record<ContentStatus, string> = {
  PENDING:  "bg-amber-100 text-amber-800",
  APPROVED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-red-100 text-red-800",
}

export default async function AdminShopsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const status = (params.status as ContentStatus) || "PENDING"
  const page = Number(params.page ?? 1)

  const result = await adminListShops({ status: status || undefined, page, limit: 20 })

  function tabHref(s: string) {
    const p = new URLSearchParams()
    if (s) p.set("status", s)
    const q = p.toString()
    return `/admin/shops${q ? "?" + q : ""}`
  }

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Shop Directory</h1>
        <span className="text-sm text-muted-foreground">{result.total} total</span>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={tabHref(tab.value)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              status === tab.value
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {result.items.length === 0 ? (
        <div className="rounded-xl border border-dashed py-14 text-center text-muted-foreground">
          No shops found.
        </div>
      ) : (
        <div className="space-y-4">
          {result.items.map((shop) => {
            const approveWithId = approveShopAction.bind(null, shop.id)
            const rejectWithId  = rejectShopAction.bind(null, shop.id)
            const verifyWithId  = verifyShopAction.bind(null, shop.id)
            const deleteWithId  = deleteShopAction.bind(null, shop.id)

            return (
              <div key={shop.id} className="rounded-xl border bg-card p-5">
                <div className="mb-3 flex flex-wrap items-start gap-3">
                  <div className="flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS[shop.status]}`}>
                        {shop.status}
                      </span>
                      {shop.is_verified && (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                          <BadgeCheck size={10} /> Verified
                        </span>
                      )}
                      {shop.is_featured && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                          Featured
                        </span>
                      )}
                    </div>
                    <h2 className="font-heading text-base font-semibold">{shop.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {SHOP_CATEGORY_LABELS[shop.category]} · {shop.address}
                    </p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <div>{shop.view_count} views</div>
                    <div>{new Date(shop.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                  </div>
                </div>

                <div className="mb-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground sm:grid-cols-3">
                  {shop.phone && <span><span className="font-medium text-foreground">Phone:</span> {shop.phone}</span>}
                  {shop.email && <span><span className="font-medium text-foreground">Email:</span> {shop.email}</span>}
                  {shop.opening_hours && <span><span className="font-medium text-foreground">Hours:</span> {shop.opening_hours}</span>}
                </div>

                <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{shop.description}</p>

                {shop.tags.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-1">
                    {shop.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2 border-t pt-3">
                  <Link
                    href={`/shops/${shop.id}`}
                    target="_blank"
                    className="rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:bg-muted"
                  >
                    View
                  </Link>

                  {shop.status !== "APPROVED" && (
                    <form action={approveWithId}>
                      <button
                        type="submit"
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
                      >
                        Approve
                      </button>
                    </form>
                  )}

                  {shop.status !== "REJECTED" && (
                    <form action={rejectWithId} className="flex items-center gap-2">
                      <input
                        name="rejection_note"
                        type="text"
                        placeholder="Rejection reason (optional)"
                        className="rounded-lg border bg-background px-3 py-1.5 text-xs outline-none focus:border-primary"
                      />
                      <button
                        type="submit"
                        className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-600"
                      >
                        Reject
                      </button>
                    </form>
                  )}

                  {/* Verify / Unverify toggle */}
                  <form action={verifyWithId}>
                    <input type="hidden" name="verified" value={shop.is_verified ? "false" : "true"} />
                    <button
                      type="submit"
                      className={`flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                        shop.is_verified
                          ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                          : "border-slate-200 text-slate-600 hover:bg-muted"
                      }`}
                    >
                      <BadgeCheck size={11} />
                      {shop.is_verified ? "Unverify" : "Mark Verified"}
                    </button>
                  </form>

                  <form action={deleteWithId} className="ml-auto">
                    <button
                      type="submit"
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {result.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          {page > 1 && (
            <Link href={`/admin/shops?status=${status}&page=${page - 1}`} className="rounded-lg border px-4 py-2 text-sm transition hover:bg-muted">
              Previous
            </Link>
          )}
          <span className="text-sm text-muted-foreground">Page {page} of {result.totalPages}</span>
          {page < result.totalPages && (
            <Link href={`/admin/shops?status=${status}&page=${page + 1}`} className="rounded-lg border px-4 py-2 text-sm transition hover:bg-muted">
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
