import Link from "next/link"
import { Store, Plus } from "lucide-react"
import { getCachedShops } from "@/lib/data/cached"
import { ShopCard } from "@/components/shops/shop-card"
import { T } from "@/components/ui/t"

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

export const metadata = {
  title: "Shop Directory — New Market",
  description: "Discover local shops and businesses in New Market, Bhopal.",
}

export default async function ShopsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = Number(params.page ?? 1)

  let result = {
    items: [] as Awaited<ReturnType<typeof getCachedShops>>["items"],
    total: 0,
    totalPages: 0,
  }

  try {
    result = await getCachedShops({ page, limit: 12 })
  } catch {
    // Supabase unavailable
  }

  function buildHref(overrides: Record<string, string | undefined>) {
    const merged = { page: undefined, ...overrides }
    const p = new URLSearchParams()
    if (merged.page && merged.page !== "1") p.set("page", merged.page)
    const q = p.toString()
    return `/shops${q ? "?" + q : ""}`
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 font-heading text-2xl font-bold">
            <Store size={22} className="text-primary" />
            <T en="Shop Directory" hi="दुकान डायरेक्टरी" />
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {result.total > 0 ? (
              <T
                en={`${result.total} shop${result.total !== 1 ? "s" : ""} in New Market`}
                hi={`न्यू मार्केट में ${result.total} दुकानें`}
              />
            ) : (
              <T en="Local businesses in New Market, Bhopal" hi="न्यू मार्केट, भोपाल की दुकानें" />
            )}
          </p>
        </div>
        <Link
          href="/shops/add"
          className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          <Plus size={15} />
          <T en="Add Shop" hi="दुकान जोड़ें" />
        </Link>
      </div>

      {/* Grid */}
      {result.items.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {result.items.map((shop) => (
              <ShopCard key={shop.id} shop={shop} />
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
          <Store size={32} className="mx-auto mb-3 text-muted-foreground/40" />
          <p className="mb-1 font-medium text-muted-foreground">
            <T en="No shops listed yet." hi="अभी कोई दुकान नहीं।" />
          </p>
          <p className="mb-4 text-sm text-muted-foreground">
            <T en="Be the first to list your shop in New Market." hi="न्यू मार्केट में अपनी दुकान पहले जोड़ें।" />
          </p>
          <Link
            href="/shops/add"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            <Plus size={14} />
            <T en="Add Your Shop" hi="अपनी दुकान जोड़ें" />
          </Link>
        </div>
      )}
    </div>
  )
}
