// Client-safe — no server imports. Import from here in client components and server actions.

export type PropertyType = "SHOP" | "OFFICE" | "WAREHOUSE" | "SHOWROOM" | "KIOSK" | "OTHER"
export type ListingType  = "RENT" | "SALE" | "LEASE"
export type ContentStatus = "PENDING" | "APPROVED" | "REJECTED"

export interface PropertyListing {
  id: string
  title: string
  description: string
  property_type: PropertyType
  listing_type: ListingType
  address: string
  floor: string | null
  area_sqft: number | null
  price: number | null
  price_label: string | null
  deposit: number | null
  is_furnished: boolean
  amenities: string[]
  images: string[]
  contact_name: string
  contact_phone: string | null
  contact_email: string
  status: ContentStatus
  rejection_note: string | null
  reviewed_at: string | null
  is_featured: boolean
  expires_at: string | null
  view_count: number
  created_at: string
  updated_at: string
}

export type PropertyCardData = Pick<
  PropertyListing,
  | "id" | "title" | "property_type" | "listing_type" | "address" | "floor"
  | "area_sqft" | "price" | "price_label" | "is_furnished" | "amenities"
  | "images" | "is_featured" | "view_count" | "created_at" | "expires_at"
>

export interface SubmitPropertyInput {
  title: string
  description: string
  property_type: PropertyType
  listing_type: ListingType
  address: string
  floor?: string
  area_sqft?: number
  price?: number
  price_label?: string
  deposit?: number
  is_furnished?: boolean
  amenities?: string[]
  images?: string[]
  contact_name: string
  contact_phone?: string
  contact_email: string
}

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  SHOP:      "Shop / Retail",
  OFFICE:    "Office Space",
  WAREHOUSE: "Warehouse / Godown",
  SHOWROOM:  "Showroom",
  KIOSK:     "Kiosk / Counter",
  OTHER:     "Other",
}

export const LISTING_TYPE_LABELS: Record<ListingType, string> = {
  RENT:  "For Rent",
  SALE:  "For Sale",
  LEASE: "Long-term Lease",
}

export const PROPERTY_TYPE_LABELS_BI: Record<PropertyType, { en: string; hi: string }> = {
  SHOP:      { en: "Shop / Retail",      hi: "दुकान" },
  OFFICE:    { en: "Office Space",       hi: "ऑफिस" },
  WAREHOUSE: { en: "Warehouse / Godown", hi: "गोदाम" },
  SHOWROOM:  { en: "Showroom",           hi: "शोरूम" },
  KIOSK:     { en: "Kiosk / Counter",    hi: "कियोस्क" },
  OTHER:     { en: "Other",             hi: "अन्य" },
}

export const LISTING_TYPE_LABELS_BI: Record<ListingType, { en: string; hi: string }> = {
  RENT:  { en: "For Rent",         hi: "किराये पर" },
  SALE:  { en: "For Sale",         hi: "बिक्री हेतु" },
  LEASE: { en: "Long-term Lease",  hi: "दीर्घकालिक लीज़" },
}

export function formatPrice(
  price?: number | null,
  label?: string | null,
  listingType?: ListingType
): string {
  if (label) return label
  if (!price) return "Price on request"
  const fmt = "₹" + price.toLocaleString("en-IN")
  if (listingType === "RENT")  return `${fmt}/mo`
  if (listingType === "LEASE") return `${fmt}/mo`
  return fmt
}
