"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

async function getAuthUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login?redirect=/my-stuff")
  return { supabase, user }
}

export async function deleteMyJobAction(id: string) {
  const { supabase, user } = await getAuthUser()

  await supabase
    .from("job_listings")
    .delete()
    .eq("id", id)
    .eq("contact_email", user.email)

  revalidatePath("/my-stuff")
  revalidatePath("/jobs")
}

export async function deleteMyShopAction(id: string) {
  const { supabase, user } = await getAuthUser()

  await supabase
    .from("shops")
    .delete()
    .eq("id", id)
    .eq("email", user.email)

  revalidatePath("/my-stuff")
  revalidatePath("/shops")
}

export async function deleteMyPropertyAction(id: string) {
  const { supabase, user } = await getAuthUser()

  await supabase
    .from("property_listings")
    .delete()
    .eq("id", id)
    .eq("contact_email", user.email)

  revalidatePath("/my-stuff")
  revalidatePath("/property")
}

export async function deleteMyCommentAction(id: string) {
  const { supabase, user } = await getAuthUser()

  await supabase
    .from("article_comments")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  revalidatePath("/my-stuff")
}

export async function deleteMyNewsAction(id: string) {
  const { supabase, user } = await getAuthUser()

  // Only allow deleting PENDING or REJECTED news (not published content)
  await supabase
    .from("news_articles")
    .delete()
    .eq("id", id)
    .eq("submitter_email", user.email)
    .in("status", ["PENDING", "REJECTED"])

  revalidatePath("/my-stuff")
}
