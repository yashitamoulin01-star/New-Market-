"use server"

import { submitShop, type SubmitShopInput, type ShopCategory } from "@/lib/supabase/shops"

export interface AddShopState {
  success: boolean
  error?: string
  shop?: { id: string; name: string }
}

function strip(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim()
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function addShopAction(
  _prev: AddShopState,
  formData: FormData
): Promise<AddShopState> {
  const raw = Object.fromEntries(formData.entries())

  const tagsRaw = strip(String(raw.tags || ""))
  const tags = tagsRaw
    ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 20)
    : []

  const email = String(raw.email || "").trim().toLowerCase() || undefined
  if (email && !isValidEmail(email))
    return { success: false, error: "Please enter a valid email address." }

  const input: SubmitShopInput = {
    name:            strip(String(raw.name || "")),
    description:     strip(String(raw.description || "")),
    category:        raw.category as ShopCategory,
    address:         strip(String(raw.address || "")),
    phone:           String(raw.phone || "").trim() || undefined,
    email,
    website:         String(raw.website || "").trim() || undefined,
    logo_url:        String(raw.logo_url || "").trim() || undefined,
    cover_image_url: String(raw.cover_image_url || "").trim() || undefined,
    opening_hours:   strip(String(raw.opening_hours || "")) || undefined,
    tags,
  }

  if (!input.name)        return { success: false, error: "Shop name is required." }
  if (input.name.length > 100) return { success: false, error: "Shop name must be under 100 characters." }
  if (!input.description) return { success: false, error: "Description is required." }
  if (!input.category)    return { success: false, error: "Category is required." }
  if (!input.address)     return { success: false, error: "Address is required." }

  try {
    const shop = await submitShop(input)
    return { success: true, shop }
  } catch {
    return { success: false, error: "Submission failed. Please try again." }
  }
}
