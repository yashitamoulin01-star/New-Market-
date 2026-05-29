import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.user_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { config } = await req.json()
    const res = NextResponse.json({ ok: true })
    res.cookies.set("nm-preview-layout", JSON.stringify(config), {
      httpOnly: false,
      path: "/",
      maxAge: 7200,
      sameSite: "lax",
    })
    return res
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete("nm-preview-layout")
  return res
}
