"use server"

import {
  submitProperty,
  type SubmitPropertyInput,
  type PropertyType,
  type ListingType,
} from "@/lib/supabase/property"

export interface ListPropertyState {
  success: boolean
  error?: string
  property?: { id: string; title: string }
}

function strip(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim()
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function safePositiveNumber(v: FormDataEntryValue | null | undefined): number | undefined {
  if (!v) return undefined
  const n = Number(v)
  return isFinite(n) && n > 0 ? n : undefined
}

export async function listPropertyAction(
  _prev: ListPropertyState,
  formData: FormData
): Promise<ListPropertyState> {
  const raw = Object.fromEntries(formData.entries())

  const amenitiesRaw = strip(String(raw.amenities || ""))
  const amenities = amenitiesRaw
    ? amenitiesRaw.split(",").map((a) => a.trim()).filter(Boolean).slice(0, 20)
    : []

  const imagesRaw = String(raw.images || "").trim()
  const images = imagesRaw
    ? imagesRaw.split("\n").map((u) => u.trim()).filter(Boolean).slice(0, 10)
    : []

  const contactEmail = String(raw.contact_email || "").trim().toLowerCase()

  if (contactEmail && !isValidEmail(contactEmail))
    return { success: false, error: "Please enter a valid contact email address." }

  const input: SubmitPropertyInput = {
    title:         strip(String(raw.title || "")),
    description:   strip(String(raw.description || "")),
    property_type: raw.property_type as PropertyType,
    listing_type:  raw.listing_type as ListingType,
    address:       strip(String(raw.address || "")),
    floor:         strip(String(raw.floor || "")) || undefined,
    area_sqft:     safePositiveNumber(raw.area_sqft),
    price:         safePositiveNumber(raw.price),
    price_label:   strip(String(raw.price_label || "")) || undefined,
    deposit:       safePositiveNumber(raw.deposit),
    is_furnished:  raw.is_furnished === "true",
    amenities,
    images,
    contact_name:  strip(String(raw.contact_name || "")),
    contact_phone: String(raw.contact_phone || "").trim() || undefined,
    contact_email: contactEmail,
  }

  if (!input.title)         return { success: false, error: "Title is required." }
  if (input.title.length > 200) return { success: false, error: "Title must be under 200 characters." }
  if (!input.description)   return { success: false, error: "Description is required." }
  if (!input.property_type) return { success: false, error: "Property type is required." }
  if (!input.listing_type)  return { success: false, error: "Listing type is required." }
  if (!input.address)       return { success: false, error: "Address is required." }
  if (!input.contact_name)  return { success: false, error: "Contact name is required." }
  if (!input.contact_email) return { success: false, error: "Contact email is required." }

  try {
    const property = await submitProperty(input)
    return { success: true, property }
  } catch {
    return { success: false, error: "Submission failed. Please try again." }
  }
}
