// Client-safe — no server imports. Import from here in client components and server actions.

export type JobType =
  | "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP" | "SEASONAL"

export type JobCategory =
  | "RETAIL" | "FOOD_BEVERAGE" | "TAILORING" | "ELECTRONICS"
  | "BEAUTY_WELLNESS" | "LOGISTICS_DELIVERY" | "MANAGEMENT"
  | "SECURITY" | "HOUSEKEEPING" | "OTHER"

export type ApplicationMode = "WALK_IN" | "PHONE" | "EMAIL" | "ONLINE"
export type ContentStatus = "PENDING" | "APPROVED" | "REJECTED"

export interface JobListing {
  id: string
  title: string
  description: string
  requirements: string | null
  benefits: string | null
  job_type: JobType
  category: JobCategory
  shop_name: string
  shop_address: string | null
  salary_min: number | null
  salary_max: number | null
  salary_label: string | null
  application_mode: ApplicationMode
  application_link: string | null
  contact_name: string
  contact_email: string
  contact_phone: string | null
  openings: number
  experience_years: number | null
  timing: string | null
  status: ContentStatus
  rejection_note: string | null
  reviewed_at: string | null
  is_featured: boolean
  expires_at: string | null
  view_count: number
  created_at: string
  updated_at: string
}

export type JobCardData = Pick<
  JobListing,
  | "id" | "title" | "job_type" | "category" | "shop_name" | "shop_address"
  | "salary_min" | "salary_max" | "salary_label" | "application_mode"
  | "openings" | "is_featured" | "view_count" | "created_at" | "expires_at"
>

export interface SubmitJobInput {
  title: string
  description: string
  requirements?: string
  benefits?: string
  job_type: JobType
  category: JobCategory
  shop_name: string
  shop_address?: string
  salary_min?: number
  salary_max?: number
  salary_label?: string
  application_mode: ApplicationMode
  application_link?: string
  contact_name: string
  contact_email: string
  contact_phone?: string
  openings?: number
  experience_years?: number
  timing?: string
}

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  FULL_TIME:   "Full Time",
  PART_TIME:   "Part Time",
  CONTRACT:    "Contract",
  INTERNSHIP:  "Internship",
  SEASONAL:    "Seasonal",
}

export const JOB_CATEGORY_LABELS: Record<JobCategory, string> = {
  RETAIL:              "Retail",
  FOOD_BEVERAGE:       "Food & Beverage",
  TAILORING:           "Tailoring",
  ELECTRONICS:         "Electronics",
  BEAUTY_WELLNESS:     "Beauty & Wellness",
  LOGISTICS_DELIVERY:  "Logistics & Delivery",
  MANAGEMENT:          "Management",
  SECURITY:            "Security",
  HOUSEKEEPING:        "Housekeeping",
  OTHER:               "Other",
}

export const APP_MODE_LABELS: Record<ApplicationMode, string> = {
  WALK_IN: "Walk In",
  PHONE:   "Apply by Phone",
  EMAIL:   "Apply by Email",
  ONLINE:  "Apply Online",
}

export const JOB_TYPE_LABELS_BI: Record<JobType, { en: string; hi: string }> = {
  FULL_TIME:   { en: "Full Time",          hi: "पूर्णकालिक" },
  PART_TIME:   { en: "Part Time",          hi: "अंशकालिक" },
  CONTRACT:    { en: "Contract",           hi: "ठेके पर" },
  INTERNSHIP:  { en: "Internship",         hi: "इंटर्नशिप" },
  SEASONAL:    { en: "Seasonal",           hi: "मौसमी" },
}

export const JOB_CATEGORY_LABELS_BI: Record<JobCategory, { en: string; hi: string }> = {
  RETAIL:              { en: "Retail",              hi: "रिटेल" },
  FOOD_BEVERAGE:       { en: "Food & Beverage",     hi: "खाद्य पेय" },
  TAILORING:           { en: "Tailoring",           hi: "दर्जी" },
  ELECTRONICS:         { en: "Electronics",         hi: "इलेक्ट्रॉनिक्स" },
  BEAUTY_WELLNESS:     { en: "Beauty & Wellness",   hi: "सौंदर्य" },
  LOGISTICS_DELIVERY:  { en: "Logistics & Delivery",hi: "लॉजिस्टिक्स" },
  MANAGEMENT:          { en: "Management",          hi: "प्रबंधन" },
  SECURITY:            { en: "Security",            hi: "सुरक्षा" },
  HOUSEKEEPING:        { en: "Housekeeping",        hi: "हाउसकीपिंग" },
  OTHER:               { en: "Other",               hi: "अन्य" },
}

export const APP_MODE_LABELS_BI: Record<ApplicationMode, { en: string; hi: string }> = {
  WALK_IN: { en: "Walk In",         hi: "सीधे आएँ" },
  PHONE:   { en: "Apply by Phone",  hi: "फ़ोन पर आवेदन" },
  EMAIL:   { en: "Apply by Email",  hi: "ईमेल पर आवेदन" },
  ONLINE:  { en: "Apply Online",    hi: "ऑनलाइन आवेदन" },
}

export function formatSalary(
  min?: number | null,
  max?: number | null,
  label?: string | null
): string {
  if (label) return label
  const fmt = (n: number) => "₹" + n.toLocaleString("en-IN") + "/mo"
  if (min && max) return `₹${min.toLocaleString("en-IN")} – ₹${max.toLocaleString("en-IN")}/mo`
  if (min) return `${fmt(min)}+`
  if (max) return `Up to ${fmt(max)}`
  return "Salary not disclosed"
}
