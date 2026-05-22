"use server"

import { submitNews, type SubmitNewsInput } from "@/lib/supabase/news"
import { revalidatePath } from "next/cache"

export interface SubmittedArticle {
  title: string
  category: string
  excerpt: string | null
  content: string
  submitter_name: string
  is_anonymous: boolean
}

export interface SubmitState {
  success: boolean
  error?: string
  article?: SubmittedArticle
}

function stripTags(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim()
}

export async function submitNewsAction(
  _prev: SubmitState,
  formData: FormData
): Promise<SubmitState> {
  const title           = stripTags(String(formData.get("title") ?? ""))
  const category        = String(formData.get("category") ?? "")
  const excerpt         = stripTags(String(formData.get("excerpt") ?? ""))
  const content         = stripTags(String(formData.get("content") ?? ""))
  const cover_image_url = String(formData.get("cover_image_url") ?? "").trim()
  const submitter_email = String(formData.get("submitter_email") ?? "").trim()
  const submitter_phone = String(formData.get("submitter_phone") ?? "").trim()
  const isAnonymous     = formData.get("is_anonymous") === "true"
  const realName        = stripTags(String(formData.get("submitter_name") ?? ""))

  // Validation
  if (!title) return { success: false, error: "Please enter a title." }
  if (title.length > 200) return { success: false, error: "Title must be under 200 characters." }
  if (!category) return { success: false, error: "Please select a category." }
  if (!content) return { success: false, error: "Please write the full story." }
  if (content.length < 50) return { success: false, error: "Story must be at least 50 characters." }
  if (!submitter_email) return { success: false, error: "Email is required for moderation." }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submitter_email))
    return { success: false, error: "Please enter a valid email address." }
  if (!isAnonymous && !realName)
    return { success: false, error: "Please enter your name, or check 'Post anonymously'." }

  // Public display name
  const submitter_name = isAnonymous ? "Anonymous" : realName

  try {
    await submitNews({
      title,
      category: category as SubmitNewsInput["category"],
      excerpt:          excerpt          || undefined,
      content,
      cover_image_url:  cover_image_url  || undefined,
      submitter_name,
      submitter_email,
      submitter_phone:  submitter_phone  || undefined,
      is_anonymous:     isAnonymous,
    })

    revalidatePath("/news")

    return {
      success: true,
      article: {
        title,
        category,
        excerpt: excerpt || null,
        content,
        submitter_name,
        is_anonymous: isAnonymous,
      },
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[submitNewsAction] error:", msg)
    if (msg.includes("column") || msg.includes("does not exist"))
      return { success: false, error: "Database error: please contact support. (schema mismatch)" }
    if (msg.includes("violates row-level security") || msg.includes("new row violates"))
      return { success: false, error: "Permission error: please sign in and try again." }
    return { success: false, error: "Submission failed. Please try again." }
  }
}
