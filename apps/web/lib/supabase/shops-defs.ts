// Client-safe — no server imports. Import from here in client components and server actions.

export type ShopCategory =
  | "CLOTHING" | "FOOD_BEVERAGE" | "ELECTRONICS" | "BEAUTY_WELLNESS"
  | "TAILORING" | "JEWELRY" | "PHARMACY" | "BOOKS_STATIONERY"
  | "FOOTWEAR" | "HANDICRAFTS" | "MOBILE_ACCESSORIES" | "OPTICALS" | "OTHER"

export type ContentStatus = "PENDING" | "APPROVED" | "REJECTED"

export interface Shop {
  id: string
  name: string
  description: string
  category: ShopCategory
  address: string
  phone: string | null
  email: string | null
  website: string | null
  logo_url: string | null
  cover_image_url: string | null
  images: string[]
  opening_hours: string | null
  tags: string[]
  status: ContentStatus
  is_verified: boolean
  rejection_note: string | null
  reviewed_at: string | null
  is_featured: boolean
  view_count: number
  created_at: string
  updated_at: string
}

export type ShopCardData = Pick<
  Shop,
  | "id" | "name" | "category" | "address" | "phone"
  | "logo_url" | "cover_image_url" | "images" | "opening_hours" | "tags"
  | "is_verified" | "is_featured" | "view_count" | "created_at"
>

export interface SubmitShopInput {
  name: string
  description: string
  category?: ShopCategory
  address: string
  phone?: string
  email?: string
  website?: string
  logo_url?: string
  cover_image_url?: string
  images?: string[]
  opening_hours?: string
  tags?: string[]
}

export const SHOP_CATEGORY_LABELS: Record<ShopCategory, string> = {
  CLOTHING:           "Clothing & Apparel",
  FOOD_BEVERAGE:      "Food & Beverages",
  ELECTRONICS:        "Electronics",
  BEAUTY_WELLNESS:    "Beauty & Wellness",
  TAILORING:          "Tailoring",
  JEWELRY:            "Jewelry & Accessories",
  PHARMACY:           "Pharmacy & Medical",
  BOOKS_STATIONERY:   "Books & Stationery",
  FOOTWEAR:           "Footwear",
  HANDICRAFTS:        "Handicrafts & Gifts",
  MOBILE_ACCESSORIES: "Mobile & Accessories",
  OPTICALS:           "Opticals & Eyewear",
  OTHER:              "Other",
}

export const SHOP_CATEGORY_LABELS_BI: Record<ShopCategory, { en: string; hi: string }> = {
  CLOTHING:           { en: "Clothing & Apparel",  hi: "कपड़े" },
  FOOD_BEVERAGE:      { en: "Food & Beverages",    hi: "खाद्य पेय" },
  ELECTRONICS:        { en: "Electronics",         hi: "इलेक्ट्रॉनिक्स" },
  BEAUTY_WELLNESS:    { en: "Beauty & Wellness",   hi: "सौंदर्य" },
  TAILORING:          { en: "Tailoring",           hi: "दर्जी" },
  JEWELRY:            { en: "Jewelry",             hi: "जेवर" },
  PHARMACY:           { en: "Pharmacy",            hi: "दवाई" },
  BOOKS_STATIONERY:   { en: "Books & Stationery",  hi: "किताब-स्टेशनरी" },
  FOOTWEAR:           { en: "Footwear",            hi: "जूते-चप्पल" },
  HANDICRAFTS:        { en: "Handicrafts",         hi: "हस्तशिल्प" },
  MOBILE_ACCESSORIES: { en: "Mobile & Acc.",       hi: "मोबाइल" },
  OPTICALS:           { en: "Opticals",            hi: "चश्मा" },
  OTHER:              { en: "Other",               hi: "अन्य" },
}
