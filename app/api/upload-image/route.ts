import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get("file") as File | null
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 })

    const maxMb = 5
    if (file.size > maxMb * 1024 * 1024) {
      return NextResponse.json({ error: `File too large (max ${maxMb}MB)` }, { status: 400 })
    }

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: "Only JPEG, PNG, WEBP, GIF, AVIF allowed" }, { status: 400 })
    }

    const supabase = await createClient()

    const ext = file.name.split(".").pop() ?? "jpg"
    const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const bytes = await file.arrayBuffer()

    const { error } = await supabase.storage
      .from("public-uploads")
      .upload(path, bytes, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data } = supabase.storage.from("public-uploads").getPublicUrl(path)
    return NextResponse.json({ url: data.publicUrl })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
