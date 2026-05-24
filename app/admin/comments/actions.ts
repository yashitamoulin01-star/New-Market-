"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function adminDeleteCommentAction(commentId: string): Promise<void> {
  const supabase = await createClient()
  await supabase.from("article_comments").delete().eq("id", commentId)
  revalidatePath("/admin/comments")
}
