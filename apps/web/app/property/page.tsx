import Link from "next/link"
import { Building2, Plus } from "lucide-react"
import { getCachedProperties } from "@/lib/data/cached"
import {
  PROPERTY_TYPE_LABELS_BI,
  type PropertyType,
  type ListingType,
} from "@/lib/supabase/property-defs"
import { PropertyCard } from "@/components/property/property-card"
import { T } from "@/components/ui/t"

interface PageProps {
  searchParams: Promise<{ type?: string; listing?: string; page?: string }>
}

export const metadata = {
  title: "Property Listings — New Market",
  description: "Commercial spaces for rent and sale in New Market, Bhopal.",
}

const LISTING_TABS: { key: string; en: string; hi: string }[] = [
  { key: "",      en: "All",              hi: "सभी" },
  { key: "RENT",  en: "For Rent",         hi: "किराये पर" },
  { key: "SALE",  en: "For Sale",         hi: "बिक्री हेतु" },
  { key: "LEASE", en: "Long-term Lease",  hi: "दीर्घकालिक लीज़" },
]

export default async function PropertyPage({ searchParams }: PageProps) {
  const params       = await searchParams
  const propertyType = params.type    as PropertyType | undefined
  const listingType  = params.listing as ListingType  | undefined
  const page         = Number(params.page ?? 1)

  let result = {
    items: [] as Awaited<ReturnType<typeof getCachedProperties>>["items"],
    total: 0,
    totalPages: 0,
  }

  try {
    result = await getCachedProperties({ page, limit: 12, propertyType, listingType })
  } catch {
    // Supabase unavailable
  }

  function buildHref(overrides: Record<string, string | undefined>) {
    const merged = { type: propertyType, listing: listingType, page: undefined, ...overrides }
    const p = new URLSearchParams()
    if (merged.type)    p.set("type", merged.type)
    if (merged.listing) p.set("listing", merged.listing)
    if (merged.page && merged.page !== "1") p.set("page", merged.page)
    const q = p.toString()
    return `/property${q ? "?" + q : ""}`
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 font-heading text-2xl font-bold">
            <Building2 size={22} className="text-primary" />
            <T en="Property Listings" hi="संपत्ति लिस्टिंग" />
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {result.total > 0 ? (
              <T
                en={`${result.total} propert${result.total !== 1 ? "ies" : "y"} in New Market`}
                hi={`न्यूमार्केट में ${result.total} संपत्तियाँ`}
              />
            ) : (
              <T en="Commercial spaces in New Market, Bhopal" hi="न्यूमार्केट में व्यावसायिक स्थान" />
            )}
          </p>
        </div>
        <Link
          href="/property/list"
          className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          <Plus size={15} />
          <T en="List Property" hi="संपत्ति लिस्ट करें" />
        </Link>
      </div>

      {/* Listing type tabs */}
      <div className="mb-3 flex gap-1 border-b">
        {LISTING_TABS.map(({ key, en, hi }) => (
          <Link
            key={key}
            href={buildHref({ listing: key || undefined })}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              (listingType ?? "") === key
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <T en={en} hi={hi} />
          </Link>
        ))}
      </div>

      {/* Property type filters */}
      <div className="mb-6 flex flex-wrap gap-1.5">
        <Link
          href={buildHref({ type: undefined })}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
            !propertyType
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary"
          }`}
        >
          <T en="All Types" hi="सभी प्रकार" />
        </Link>
        {(Object.entries(PROPERTY_TYPE_LABELS_BI) as [PropertyType, { en: string; hi: string }][]).map(([key, label]) => (
          <Link
            key={key}
            href={buildHref({ type: key })}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              propertyType === key
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary"
            }`}
          >
            <T en={label.en} hi={label.hi} />
          </Link>
        ))}
      </div>

      {/* Grid */}
      {result.items.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {result.items.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          {result.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              {page > 1 && (
                <Link
                  href={buildHref({ page: String(page - 1) })}
                  className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted"
                >
                  <T en="Previous" hi="पिछला" />
                </Link>
              )}
              <span className="text-sm text-muted-foreground">
                <T en={`Page ${page} of ${result.totalPages}`} hi={`पृष्ठ ${page} / ${result.totalPages}`} />
              </span>
              {page < result.totalPages && (
                <Link
                  href={buildHref({ page: String(page + 1) })}
                  className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted"
                >
                  <T en="Next" hi="अगला" />
                </Link>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="rounded-xl border border-dashed bg-card py-16 text-center">
          <Building2 size={32} className="mx-auto mb-3 text-muted-foreground/40" />
          <p className="mb-1 font-medium text-muted-foreground">
            {propertyType || listingType
              ? <T en="No properties match your filters." hi="कोई संपत्ति नहीं मिली।" />
              : <T en="No property listings yet." hi="अभी कोई संपत्ति नहीं।" />
            }
          </p>
          <p className="mb-4 text-sm text-muted-foreground">
            {propertyType || listingType ? (
              <Link href="/property" className="text-primary hover:underline">
                <T en="Clear filters" hi="फ़िल्टर हटाएँ" />
              </Link>
            ) : (
              <T en="Be the first to list a commercial space in New Market." hi="न्यूमार्केट में पहली संपत्ति लिस्ट करें।" />
            )}
          </p>
          <Link
            href="/property/list"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            <Plus size={14} />
            <T en="List a Property" hi="संपत्ति लिस्ट करें" />
          </Link>
        </div>
      )}
    </div>
  )
}
