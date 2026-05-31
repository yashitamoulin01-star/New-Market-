import Link from "next/link"
import type { Metadata } from "next"
import {
  Clock, CheckCircle, XCircle, Inbox, ChevronDown, ChevronUp, Star, Radio,
} from "lucide-react"
import {
  adminListProperties,
  PROPERTY_TYPE_LABELS, LISTING_TYPE_LABELS, formatPrice,
  type ContentStatus,
} from "@/lib/supabase/property"
import {
  approvePropertyAction, rejectPropertyAction, deletePropertyAction,
  restorePropertyAction, editPropertyAction, featurePropertyAction,
} from "./actions"

export const metadata: Metadata = { title: "Admin — Property Queue" }

type Tab = "PENDING" | "LIVE" | "REJECTED"
const TABS: { label: string; value: Tab }[] = [
  { label: "Pending",  value: "PENDING" },
  { label: "Live",     value: "LIVE" },
  { label: "Rejected", value: "REJECTED" },
]

const LISTING_BADGE: Record<string, string> = {
  RENT:  "bg-blue-50 text-blue-700",
  SALE:  "bg-emerald-50 text-emerald-700",
  LEASE: "bg-violet-50 text-violet-700",
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

export default async function AdminPropertyPage({
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

  const { items, total, totalPages } = await adminListProperties({ status: dbStatus, page: currentPage })

  return (
    <div className="container max-w-4xl py-6">
      <div className="mb-5">
        <h1 className="font-heading text-xl font-bold sm:text-2xl">Property Queue</h1>
        <p className="text-sm text-muted-foreground">{total} listing{total !== 1 ? "s" : ""}</p>
      </div>

      <div className="mb-5 flex gap-0 overflow-x-auto border-b scrollbar-none">
        {TABS.map(t => (
          <Link key={t.value} href={`/admin/property?tab=${t.value}`}
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
          <strong>Review:</strong> Verify contact info and listing details, edit if needed, then Approve or Reject.
        </div>
      )}

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
          <Inbox size={36} className="mb-3 text-muted-foreground/30" />
          <p className="font-medium text-muted-foreground">Queue is clear</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(property => {

            // ── PENDING card ──────────────────────────────────────────
            if (activeTab === "PENDING") return (
              <div key={property.id} className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <div className="bg-amber-50/60 dark:bg-amber-950/20 px-4 py-3 border-b flex items-start justify-between gap-3">
                  <div>
                    <div className="mb-1 flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                        <Clock size={9} /> PENDING
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${LISTING_BADGE[property.listing_type] ?? "bg-muted text-muted-foreground"}`}>
                        {LISTING_TYPE_LABELS[property.listing_type]}
                      </span>
                      <span className="rounded-full bg-muted text-muted-foreground px-2 py-0.5 text-[10px] font-semibold">
                        {PROPERTY_TYPE_LABELS[property.property_type]}
                      </span>
                    </div>
                    <h2 className="font-heading text-base font-bold">{property.title}</h2>
                    <p className="text-xs text-muted-foreground">{property.address} · {fmt(property.created_at)}</p>
                  </div>
                  <form action={deletePropertyAction.bind(null, property.id)}>
                    <button type="submit" className="shrink-0 rounded border border-red-200 px-2.5 py-1 text-[11px] text-red-500 hover:bg-red-50 transition">Delete</button>
                  </form>
                </div>

                <div className="px-4 py-3 space-y-2 border-b">
                  <div>
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Description</p>
                    <p className="text-sm text-foreground/85 whitespace-pre-wrap max-h-40 overflow-y-auto">{property.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs pt-1">
                    <span><span className="font-medium">Price:</span> {formatPrice(property.price, property.price_label, property.listing_type)}</span>
                    {property.area_sqft && <span><span className="font-medium">Area:</span> {property.area_sqft.toLocaleString()} sq ft</span>}
                    {property.floor && <span><span className="font-medium">Floor:</span> {property.floor}</span>}
                    <span><span className="font-medium">Furnished:</span> {property.is_furnished ? "Yes" : "No"}</span>
                    <span><span className="font-medium">Contact:</span> {property.contact_name}</span>
                    <span><span className="font-medium">Email:</span> {property.contact_email}</span>
                    {property.contact_phone && <span><span className="font-medium">Phone:</span> {property.contact_phone}</span>}
                  </div>
                  {property.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {property.amenities.map(a => (
                        <span key={a} className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{a}</span>
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
                  <form action={editPropertyAction.bind(null, property.id)} className="p-4 space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold text-muted-foreground">Title</label>
                        <input name="title" defaultValue={property.title} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                      </div>
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold text-muted-foreground">Address</label>
                        <input name="address" defaultValue={property.address} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                      </div>
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold text-muted-foreground">Price Label</label>
                        <input name="price_label" defaultValue={property.price_label ?? ""} placeholder="e.g. ₹25,000/month" className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                      </div>
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold text-muted-foreground">Floor</label>
                        <input name="floor" defaultValue={property.floor ?? ""} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                      </div>
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold text-muted-foreground">Area (sq ft)</label>
                        <input name="area_sqft" type="number" defaultValue={property.area_sqft ?? ""} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                      </div>
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold text-muted-foreground">Contact Phone</label>
                        <input name="contact_phone" defaultValue={property.contact_phone ?? ""} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-muted-foreground">Description</label>
                      <textarea name="description" defaultValue={property.description} rows={4} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary resize-none" />
                    </div>
                    <button type="submit" className="rounded-lg bg-muted px-4 py-2 text-xs font-bold hover:bg-muted/80 transition">Save Edits</button>
                  </form>
                </details>

                <div className="flex flex-wrap items-center gap-2 bg-muted/5 px-4 py-3">
                  <form action={approvePropertyAction.bind(null, property.id)}>
                    <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition">
                      <CheckCircle size={11} className="inline mr-1" />Approve → Go Live
                    </button>
                  </form>
                  <form action={rejectPropertyAction.bind(null, property.id)} className="flex items-center gap-1.5 ml-auto">
                    <input name="rejection_note" type="text" placeholder="Rejection reason (optional)"
                      className="w-44 rounded-lg border bg-background px-2 py-1.5 text-xs outline-none focus:border-primary" />
                    <button type="submit" className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-600 transition">Reject</button>
                  </form>
                </div>
              </div>
            )

            // ── LIVE card ─────────────────────────────────────────────
            if (activeTab === "LIVE") return (
              <div key={property.id} className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <div className="flex items-start gap-3 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="mb-1 flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                        <Radio size={9} /> LIVE
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${LISTING_BADGE[property.listing_type] ?? "bg-muted text-muted-foreground"}`}>
                        {LISTING_TYPE_LABELS[property.listing_type]}
                      </span>
                      {property.is_featured && (
                        <span className="rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 dark:text-amber-400">⭐ Featured</span>
                      )}
                    </div>
                    <h2 className="font-heading text-sm font-bold">{property.title}</h2>
                    <p className="text-xs text-muted-foreground">
                      {PROPERTY_TYPE_LABELS[property.property_type]} · {formatPrice(property.price, property.price_label, property.listing_type)} · {fmt(property.created_at)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 border-t bg-muted/10 px-4 py-2.5">
                  <Link href={`/property/${property.id}`} target="_blank" className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted transition">
                    View Live ↗
                  </Link>

                  <form action={featurePropertyAction.bind(null, property.id, !property.is_featured)}>
                    <button type="submit" className={`flex items-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-bold border transition ${
                      property.is_featured
                        ? "bg-amber-500/15 text-amber-700 border-amber-200 dark:text-amber-400"
                        : "border-border bg-muted/40 text-muted-foreground hover:bg-muted"
                    }`}>
                      <Star size={10} />{property.is_featured ? "Unfeature" : "Feature"}
                    </button>
                  </form>

                  <form action={deletePropertyAction.bind(null, property.id)} className="ml-auto">
                    <button type="submit" className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition">Remove</button>
                  </form>
                </div>

                <details className="border-t group">
                  <summary className="flex cursor-pointer items-center justify-between bg-muted/10 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:bg-muted/20 transition list-none">
                    <span>Edit</span>
                    <ChevronDown size={13} className="group-open:hidden" />
                    <ChevronUp   size={13} className="hidden group-open:block" />
                  </summary>
                  <form action={editPropertyAction.bind(null, property.id)} className="p-4 space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold text-muted-foreground">Title</label>
                        <input name="title" defaultValue={property.title} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                      </div>
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold text-muted-foreground">Price Label</label>
                        <input name="price_label" defaultValue={property.price_label ?? ""} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-muted-foreground">Description</label>
                      <textarea name="description" defaultValue={property.description} rows={3} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary resize-none" />
                    </div>
                    <button type="submit" className="rounded-lg bg-muted px-4 py-2 text-xs font-bold hover:bg-muted/80 transition">Save</button>
                  </form>
                </details>
              </div>
            )

            // ── REJECTED card ─────────────────────────────────────────
            return (
              <div key={property.id} className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <div className="flex items-start gap-3 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="mb-1 flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700 dark:bg-red-900/30 dark:text-red-300">
                        <XCircle size={9} /> REJECTED
                      </span>
                    </div>
                    <h2 className="font-heading text-sm font-bold">{property.title}</h2>
                    <p className="text-xs text-muted-foreground">{property.address} · {fmt(property.created_at)}</p>
                  </div>
                </div>
                {property.rejection_note && (
                  <div className="border-t flex items-start gap-2 bg-red-50 dark:bg-red-950/20 px-4 py-2.5 text-xs text-red-700 dark:text-red-300">
                    <XCircle size={11} className="mt-0.5 shrink-0" />{property.rejection_note}
                  </div>
                )}
                <div className="flex items-center gap-2 border-t bg-muted/5 px-4 py-3">
                  <form action={restorePropertyAction.bind(null, property.id)}>
                    <button type="submit" className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted transition">↩ Restore to Pending</button>
                  </form>
                  <form action={deletePropertyAction.bind(null, property.id)} className="ml-auto">
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
            <Link href={`/admin/property?tab=${activeTab}&page=${currentPage - 1}`} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted transition">Previous</Link>
          )}
          <span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</span>
          {currentPage < totalPages && (
            <Link href={`/admin/property?tab=${activeTab}&page=${currentPage + 1}`} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted transition">Next</Link>
          )}
        </div>
      )}
    </div>
  )
}
