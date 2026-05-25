import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import {
  MapPin, Phone, Mail, Globe, Clock,
  BadgeCheck, Eye, ChevronLeft, Calendar,
} from "lucide-react"
import { getShopById, SHOP_CATEGORY_LABELS_BI } from "@/lib/supabase/shops"
import { T } from "@/components/ui/t"

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const shop = await getShopById(id)
  if (!shop) return { title: "Shop Not Found" }
  return {
    title: `${shop.name} — New Market`,
    description: shop.description.slice(0, 160),
  }
}

export default async function ShopDetailPage({ params }: PageProps) {
  const { id } = await params
  const shop = await getShopById(id)
  if (!shop) notFound()

  const listedDate = new Date(shop.created_at).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  })
  const catLabel = SHOP_CATEGORY_LABELS_BI[shop.category]

  return (
    <div className="container py-8">
      <Link
        href="/shops"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition"
      >
        <ChevronLeft size={15} />
        <T en="All Shops" hi="सभी दुकानें" />
      </Link>

      {shop.cover_image_url && (
        <div className="relative mb-6 h-48 w-full overflow-hidden rounded-xl sm:h-64">
          <Image
            src={shop.cover_image_url}
            alt={shop.name}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border bg-card p-6">
            <div className="mb-4 flex items-start gap-4">
              {shop.logo_url && (
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border bg-muted">
                  <Image src={shop.logo_url} alt={shop.name} fill className="object-contain p-1" />
                </div>
              )}
              <div className="flex-1">
                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    {catLabel ? <T en={catLabel.en} hi={catLabel.hi} /> : shop.category}
                  </span>
                  {shop.is_verified && (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      <BadgeCheck size={11} />
                      <T en="Verified" hi="सत्यापित" />
                    </span>
                  )}
                  {shop.is_featured && (
                    <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
                      <T en="Featured" hi="फ़ीचर्ड" />
                    </span>
                  )}
                </div>
                <h1 className="font-heading text-2xl font-bold text-foreground">{shop.name}</h1>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap" style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>
              {shop.description}
            </p>

            {shop.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {shop.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-5 flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar size={11} />
                <T en={`Listed ${listedDate}`} hi={`सूचीबद्ध ${listedDate}`} />
              </span>
              <span className="flex items-center gap-1">
                <Eye size={11} />
                {shop.view_count.toLocaleString()} <T en="views" hi="व्यूज़" />
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-5">
            <h2 className="mb-4 font-heading text-base font-semibold">
              <T en="Contact & Location" hi="संपर्क और स्थान" />
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin size={14} className="mt-0.5 shrink-0 text-primary" />
                <span>{shop.address}</span>
              </div>

              {shop.opening_hours && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock size={14} className="shrink-0 text-primary" />
                  <span>{shop.opening_hours}</span>
                </div>
              )}

              {shop.phone && (
                <a
                  href={`tel:${shop.phone}`}
                  className="flex items-center gap-2 text-muted-foreground transition hover:text-primary"
                >
                  <Phone size={14} className="shrink-0 text-primary" />
                  {shop.phone}
                </a>
              )}

              {shop.email && (
                <a
                  href={`mailto:${shop.email}`}
                  className="flex items-center gap-2 break-all text-muted-foreground transition hover:text-primary"
                >
                  <Mail size={14} className="shrink-0 text-primary" />
                  {shop.email}
                </a>
              )}

              {shop.website && (
                <a
                  href={shop.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground transition hover:text-primary"
                >
                  <Globe size={14} className="shrink-0 text-primary" />
                  <T en="Website" hi="वेबसाइट" />
                </a>
              )}
            </div>

            {shop.phone && (
              <a
                href={`tel:${shop.phone}`}
                className="mt-4 block w-full rounded-lg bg-primary py-2.5 text-center text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                <T en="Call Shop" hi="दुकान पर कॉल करें" />
              </a>
            )}
          </div>

          <div className="rounded-xl border bg-primary/5 p-5 text-center">
            <p className="mb-2 text-sm font-medium">
              <T en="Own a shop here?" hi="यहाँ आपकी दुकान है?" />
            </p>
            <Link
              href="/shops/add"
              className="inline-block rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              <T en="List Your Shop Free" hi="मुफ़्त दुकान दर्ज करें" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
