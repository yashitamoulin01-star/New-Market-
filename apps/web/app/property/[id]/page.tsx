import Link from "next/link"
import { notFound } from "next/navigation"
import { SafeImage } from "@/components/ui/safe-image"
import {
  MapPin, Phone, Mail, Maximize2, Eye,
  ChevronLeft, Calendar, Sofa, IndianRupee, Building2,
} from "lucide-react"
import {
  getPropertyById,
  PROPERTY_TYPE_LABELS_BI,
  LISTING_TYPE_LABELS_BI,
  formatPrice,
} from "@/lib/supabase/property"
import { T } from "@/components/ui/t"

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const property = await getPropertyById(id)
  if (!property) return { title: "Property Not Found" }
  return {
    title: `${property.title} — New Market`,
    description: property.description?.slice(0, 160) ?? "",
  }
}

const LISTING_BADGE: Record<string, string> = {
  RENT:  "bg-blue-600 text-white",
  SALE:  "bg-emerald-600 text-white",
  LEASE: "bg-violet-600 text-white",
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { id } = await params
  const property = await getPropertyById(id)
  if (!property) notFound()

  const price  = formatPrice(property.price, property.price_label, property.listing_type)
  const listed = new Date(property.created_at).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  })

  const listingLabel  = LISTING_TYPE_LABELS_BI[property.listing_type]
  const propertyLabel = PROPERTY_TYPE_LABELS_BI[property.property_type]

  return (
    <div className="container py-8">
      <Link
        href="/property"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition"
      >
        <ChevronLeft size={15} />
        <T en="All Properties" hi="सभी संपत्तियाँ" />
      </Link>

      {property.images.length > 0 && (
        <div className="mb-6 grid gap-2 overflow-hidden rounded-xl sm:grid-cols-2 lg:grid-cols-3">
          {property.images.slice(0, 3).map((src, i) => (
            <div
              key={i}
              className={`relative overflow-hidden rounded-xl ${
                i === 0 && property.images.length > 1
                  ? "sm:col-span-2 sm:row-span-2 h-64 sm:h-72"
                  : "h-40"
              }`}
              style={i === 0 && property.images.length === 1 ? { height: "280px" } : undefined}
            >
              <SafeImage
                src={src}
                alt={`${property.title} image ${i + 1}`}
                fill
                className="object-cover"
                priority={i === 0}
              />
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main */}
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-xl border bg-card p-6">
            <div className="mb-4">
              <div className="mb-2 flex flex-wrap gap-2">
                <span className={`rounded-full px-3 py-0.5 text-xs font-bold ${LISTING_BADGE[property.listing_type]}`}>
                  {listingLabel ? <T en={listingLabel.en} hi={listingLabel.hi} /> : property.listing_type}
                </span>
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                  {propertyLabel ? <T en={propertyLabel.en} hi={propertyLabel.hi} /> : property.property_type}
                </span>
                {property.is_featured && (
                  <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
                    <T en="Featured" hi="फ़ीचर्ड" />
                  </span>
                )}
              </div>
              <h1 className="font-heading text-2xl font-bold leading-snug text-foreground">
                {property.title}
              </h1>
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin size={13} className="shrink-0" />
                {property.address}
              </p>
            </div>

            {/* Quick stats */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg bg-muted/60 p-3">
                <IndianRupee size={13} className="mb-1 text-primary" />
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  <T en="Price" hi="मूल्य" />
                </p>
                <p className="text-sm font-bold text-foreground">{price}</p>
              </div>

              {property.area_sqft && (
                <div className="rounded-lg bg-muted/60 p-3">
                  <Maximize2 size={13} className="mb-1 text-primary" />
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    <T en="Area" hi="क्षेत्रफल" />
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    {property.area_sqft.toLocaleString()} <T en="sq ft" hi="वर्ग फ़ीट" />
                  </p>
                </div>
              )}

              {property.floor && (
                <div className="rounded-lg bg-muted/60 p-3">
                  <Building2 size={13} className="mb-1 text-primary" />
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    <T en="Floor" hi="मंज़िल" />
                  </p>
                  <p className="text-sm font-bold text-foreground">{property.floor}</p>
                </div>
              )}

              <div className="rounded-lg bg-muted/60 p-3">
                <Sofa size={13} className="mb-1 text-primary" />
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  <T en="Furnished" hi="फर्निश्ड" />
                </p>
                <p className={`text-sm font-bold ${property.is_furnished ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"}`}>
                  {property.is_furnished
                    ? <T en="Yes" hi="हाँ" />
                    : <T en="Unfurnished" hi="बिना फर्नीचर" />}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="mb-2 font-heading text-base font-semibold">
                <T en="About this Property" hi="संपत्ति के बारे में" />
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap" style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>
                {property.description}
              </p>
            </div>

            {property.amenities.length > 0 && (
              <div>
                <h2 className="mb-3 font-heading text-base font-semibold">
                  <T en="Amenities" hi="सुविधाएँ" />
                </h2>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((a) => (
                    <span
                      key={a}
                      className="rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-foreground"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar size={11} />
                <T en={`Listed ${listed}`} hi={`सूचीबद्ध ${listed}`} />
              </span>
              <span className="flex items-center gap-1">
                <Eye size={11} />
                {property.view_count.toLocaleString()} <T en="views" hi="व्यूज़" />
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-5">
            <h2 className="mb-4 font-heading text-base font-semibold">
              <T en="Contact Owner" hi="मालिक से संपर्क करें" />
            </h2>

            <div className="mb-4 space-y-3 text-sm">
              <p className="font-medium text-foreground">{property.contact_name}</p>

              {property.contact_phone && (
                <a
                  href={`tel:${property.contact_phone}`}
                  className="flex items-center gap-2 text-muted-foreground transition hover:text-primary"
                >
                  <Phone size={14} className="shrink-0 text-primary" />
                  {property.contact_phone}
                </a>
              )}

              <a
                href={`mailto:${property.contact_email}?subject=Inquiry about: ${property.title}`}
                className="flex items-center gap-2 break-all text-muted-foreground transition hover:text-primary"
              >
                <Mail size={14} className="shrink-0 text-primary" />
                {property.contact_email}
              </a>
            </div>

            {property.contact_phone && (
              <a
                href={`tel:${property.contact_phone}`}
                className="mb-2 block w-full rounded-lg bg-primary py-2.5 text-center text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                <T en="Call Now" hi="अभी कॉल करें" />
              </a>
            )}
            <a
              href={`mailto:${property.contact_email}?subject=Inquiry about: ${property.title}`}
              className="block w-full rounded-lg border py-2.5 text-center text-sm font-semibold text-foreground transition hover:bg-muted"
            >
              <T en="Send Email" hi="ईमेल भेजें" />
            </a>
          </div>

          {(property.price || property.deposit) && (
            <div className="rounded-xl border bg-card p-5">
              <h2 className="mb-3 font-heading text-base font-semibold">
                <T en="Pricing" hi="मूल्य विवरण" />
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {property.listing_type === "SALE"
                      ? <T en="Sale Price" hi="बिक्री मूल्य" />
                      : <T en="Monthly Rent" hi="मासिक किराया" />}
                  </span>
                  <span className="font-semibold">{price}</span>
                </div>
                {property.deposit && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      <T en="Security Deposit" hi="सुरक्षा जमा" />
                    </span>
                    <span className="font-semibold">₹{property.deposit.toLocaleString("en-IN")}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="rounded-xl border bg-primary/5 p-5 text-center">
            <p className="mb-2 text-sm font-medium">
              <T en="Have a space to let?" hi="कोई स्थान किराये पर देना है?" />
            </p>
            <Link
              href="/property/list"
              className="inline-block rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              <T en="List Your Property" hi="संपत्ति लिस्ट करें" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
