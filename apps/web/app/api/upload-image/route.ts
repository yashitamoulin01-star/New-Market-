"use server"

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]
const MAX_BYTES = 5 * 1024 * 1024

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get("file") as File | null
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 })
    if (!ALLOWED_TYPES.includes(file.type))
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
    if (file.size > MAX_BYTES)
      return NextResponse.json({ error: "File too large (max 5 MB)" }, { status: 400 })

    const supabase = await createClient()
    const ext = file.name.split(".").pop() ?? "jpg"
    const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage
      .from("public-uploads")
      .upload(path, file, { contentType: file.type, upsert: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const { data } = supabase.storage.from("public-uploads").getPublicUrl(path)
    return NextResponse.json({ url: data.publicUrl })
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
