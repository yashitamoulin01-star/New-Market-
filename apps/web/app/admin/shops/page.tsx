import Link from "next/link"
import type { Metadata } from "next"
import {
  Clock, CheckCircle, XCircle, Inbox, ChevronDown, ChevronUp,
  BadgeCheck, Star, Radio,
} from "lucide-react"
import { adminListShops, type ContentStatus } from "@/lib/supabase/shops"
import {
  approveShopAction, rejectShopAction, deleteShopAction,
  restoreShopAction, editShopAction, featureShopAction, verifyShopAction,
} from "./actions"

export const metadata: Metadata = { title: "Admin — Shops Queue" }

type Tab = "PENDING" | "LIVE" | "REJECTED"
const TABS: { label: string; value: Tab }[] = [
  { label: "Pending",  value: "PENDING" },
  { label: "Live",     value: "LIVE" },
  { label: "Rejected", value: "REJECTED" },
]

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

export default async function AdminShopsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; page?: string }>
}) {
  const { tab, page } = await searchParams
  const activeTab = (tab as Tab) || "PENDING"
  const currentPage = Math.max(1, Number(page) || 1)

  const dbStatus: ContentStatus =
    activeTab === "LIVE" ? "APPROVED" :
    activeTab === "REJECTED" ? "REJECTED" : "PENDING"

  const { items, total, totalPages } = await adminListShops({ status: dbStatus, page: currentPage })

  return (
    <div className="container max-w-4xl py-6">
      <div className="mb-5">
        <h1 className="font-heading text-xl font-bold sm:text-2xl">Shops Queue</h1>
        <p className="text-sm text-muted-foreground">{total} listing{total !== 1 ? "s" : ""}</p>
      </div>

      <div className="mb-5 flex gap-0 overflow-x-auto border-b scrollbar-none">
        {TABS.map(t => (
          <Link key={t.value} href={`/admin/shops?tab=${t.value}`}
            className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === t.value
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}>
            {t.label}
          </Link>
        ))}
      </div>

      {activeTab === "PENDING" && (
        <div className="mb-4 rounded-lg border-l-4 border-amber-400 bg-amber-50 dark:bg-amber-950/30 px-4 py-2.5 text-xs text-amber-800 dark:text-amber-300">
          <strong>Review:</strong> Check all shop details, edit if needed, then Approve or Reject.
        </div>
      )}

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
          <Inbox size={36} className="mb-3 text-muted-foreground/30" />
          <p className="font-medium text-muted-foreground">Queue is clear</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(shop => {

            // ── PENDING card ──────────────────────────────────────────
            if (activeTab === "PENDING") return (
              <div key={shop.id} className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <div className="bg-amber-50/60 dark:bg-amber-950/20 px-4 py-3 border-b flex items-start justify-between gap-3">
                  <div>
                    <div className="mb-1 flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                        <Clock size={9} /> PENDING
                      </span>
                    </div>
                    <h2 className="font-heading text-base font-bold">{shop.name}</h2>
                    <p className="text-xs text-muted-foreground">{shop.address} · {fmt(shop.created_at)}</p>
                  </div>
                  <form action={deleteShopAction.bind(null, shop.id)}>
                    <button type="submit" className="shrink-0 rounded border border-red-200 px-2.5 py-1 text-[11px] text-red-500 hover:bg-red-50 transition">Delete</button>
                  </form>
                </div>

                <div className="px-4 py-3 space-y-2 border-b">
                  <div>
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Description</p>
                    <p className="text-sm text-foreground/85 whitespace-pre-wrap max-h-40 overflow-y-auto">{shop.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs pt-1">
                    {shop.phone && <span><span className="font-medium">Phone:</span> {shop.phone}</span>}
                    {shop.email && <span><span className="font-medium">Email:</span> {shop.email}</span>}
                    {shop.website && <span><span className="font-medium">Website:</span> {shop.website}</span>}
                    {shop.opening_hours && <span><span className="font-medium">Hours:</span> {shop.opening_hours}</span>}
                  </div>
                  {shop.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {shop.tags.map(tag => (
                        <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>

                <details className="border-b group">
                  <summary className="flex cursor-pointer items-center justify-between bg-muted/10 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:bg-muted/20 transition list-none">
                    <span>Edit Before Approving</span>
                    <ChevronDown size={13} className="group-open:hidden" />
                    <ChevronUp   size={13} className="hidden group-open:block" />
                  </summary>
                  <form action={editShopAction.bind(null, shop.id)} className="p-4 space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold text-muted-foreground">Shop Name</label>
                        <input name="name" defaultValue={shop.name} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                      </div>
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold text-muted-foreground">Address</label>
                        <input name="address" defaultValue={shop.address} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                      </div>
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold text-muted-foreground">Phone</label>
                        <input name="phone" defaultValue={shop.phone ?? ""} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                      </div>
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold text-muted-foreground">Opening Hours</label>
                        <input name="opening_hours" defaultValue={shop.opening_hours ?? ""} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-muted-foreground">Description</label>
                      <textarea name="description" defaultValue={shop.description} rows={4} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary resize-none" />
                    </div>
                    <button type="submit" className="rounded-lg bg-muted px-4 py-2 text-xs font-bold hover:bg-muted/80 transition">Save Edits</button>
                  </form>
                </details>

                <div className="flex flex-wrap items-center gap-2 bg-muted/5 px-4 py-3">
                  <form action={approveShopAction.bind(null, shop.id)}>
                    <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition">
                      <CheckCircle size={11} className="inline mr-1" />Approve → Go Live
                    </button>
                  </form>
                  <form action={rejectShopAction.bind(null, shop.id)} className="flex items-center gap-1.5 ml-auto">
                    <input name="rejection_note" type="text" placeholder="Rejection reason (optional)"
                      className="w-44 rounded-lg border bg-background px-2 py-1.5 text-xs outline-none focus:border-primary" />
                    <button type="submit" className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-600 transition">Reject</button>
                  </form>
                </div>
              </div>
            )

            // ── LIVE card ─────────────────────────────────────────────
            if (activeTab === "LIVE") return (
              <div key={shop.id} className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <div className="flex items-start gap-3 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="mb-1 flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                        <Radio size={9} /> LIVE
                      </span>
                      {shop.is_verified && (
                        <span className="flex items-center gap-0.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                          <BadgeCheck size={9} /> Verified
                        </span>
                      )}
                      {shop.is_featured && (
                        <span className="rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 dark:text-amber-400">⭐ Featured</span>
                      )}
                    </div>
                    <h2 className="font-heading text-sm font-bold">{shop.name}</h2>
                    <p className="text-xs text-muted-foreground">{shop.address} · {fmt(shop.created_at)}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 border-t bg-muted/10 px-4 py-2.5">
                  <Link href={`/shops/${shop.id}`} target="_blank" className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted transition">
                    View Live ↗
                  </Link>

                  <form action={featureShopAction.bind(null, shop.id, !shop.is_featured)}>
                    <button type="submit" className={`flex items-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-bold border transition ${
                      shop.is_featured
                        ? "bg-amber-500/15 text-amber-700 border-amber-200 dark:text-amber-400"
                        : "border-border bg-muted/40 text-muted-foreground hover:bg-muted"
                    }`}>
                      <Star size={10} />{shop.is_featured ? "Unfeature" : "Feature"}
                    </button>
                  </form>

                  <form action={verifyShopAction.bind(null, shop.id)}>
                    <input type="hidden" name="verified" value={shop.is_verified ? "false" : "true"} />
                    <button type="submit" className={`flex items-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-bold border transition ${
                      shop.is_verified
                        ? "bg-emerald-500/15 text-emerald-700 border-emerald-200 dark:text-emerald-400"
                        : "border-border bg-muted/40 text-muted-foreground hover:bg-muted"
                    }`}>
                      <BadgeCheck size={10} />{shop.is_verified ? "Unverify" : "Verify"}
                    </button>
                  </form>

                  <form action={deleteShopAction.bind(null, shop.id)} className="ml-auto">
                    <button type="submit" className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition">Remove</button>
                  </form>
                </div>

                <details className="border-t group">
                  <summary className="flex cursor-pointer items-center justify-between bg-muted/10 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:bg-muted/20 transition list-none">
                    <span>Edit</span>
                    <ChevronDown size={13} className="group-open:hidden" />
                    <ChevronUp   size={13} className="hidden group-open:block" />
                  </summary>
                  <form action={editShopAction.bind(null, shop.id)} className="p-4 space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold text-muted-foreground">Name</label>
                        <input name="name" defaultValue={shop.name} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                      </div>
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold text-muted-foreground">Phone</label>
                        <input name="phone" defaultValue={shop.phone ?? ""} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                      </div>
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold text-muted-foreground">Opening Hours</label>
                        <input name="opening_hours" defaultValue={shop.opening_hours ?? ""} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-muted-foreground">Description</label>
                      <textarea name="description" defaultValue={shop.description} rows={3} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary resize-none" />
                    </div>
                    <button type="submit" className="rounded-lg bg-muted px-4 py-2 text-xs font-bold hover:bg-muted/80 transition">Save</button>
                  </form>
                </details>
              </div>
            )

            // ── REJECTED card ─────────────────────────────────────────
            return (
              <div key={shop.id} className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <div className="flex items-start gap-3 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="mb-1 flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700 dark:bg-red-900/30 dark:text-red-300">
                        <XCircle size={9} /> REJECTED
                      </span>
                    </div>
                    <h2 className="font-heading text-sm font-bold">{shop.name}</h2>
                    <p className="text-xs text-muted-foreground">{shop.address} · {fmt(shop.created_at)}</p>
                  </div>
                </div>
                {shop.rejection_note && (
                  <div className="border-t flex items-start gap-2 bg-red-50 dark:bg-red-950/20 px-4 py-2.5 text-xs text-red-700 dark:text-red-300">
                    <XCircle size={11} className="mt-0.5 shrink-0" />{shop.rejection_note}
                  </div>
                )}
                <div className="flex items-center gap-2 border-t bg-muted/5 px-4 py-3">
                  <form action={restoreShopAction.bind(null, shop.id)}>
                    <button type="submit" className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted transition">↩ Restore to Pending</button>
                  </form>
                  <form action={deleteShopAction.bind(null, shop.id)} className="ml-auto">
                    <button type="submit" className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition">Delete Permanently</button>
                  </form>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          {currentPage > 1 && (
            <Link href={`/admin/shops?tab=${activeTab}&page=${currentPage - 1}`} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted transition">Previous</Link>
          )}
          <span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</span>
          {currentPage < totalPages && (
            <Link href={`/admin/shops?tab=${activeTab}&page=${currentPage + 1}`} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted transition">Next</Link>
          )}
        </div>
      )}
    </div>
  )
}
