import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: object }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — must use getUser(), not getSession()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  const isAdminPath = pathname.startsWith("/admin")
  const isAdminLoginPath = pathname === "/admin/login"

  // Submission routes require login
  const isProtectedSubmit =
    pathname === "/news/submit" ||
    pathname === "/jobs/post" ||
    pathname === "/shops/add" ||
    pathname === "/property/list"

  // Redirect /admin/login → /login
  if (isAdminLoginPath) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  // Admin routes: must be authenticated AND have role === 'admin'
  if (isAdminPath && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }

  if (isAdminPath && user) {
    const role = user.user_metadata?.role
    if (role !== "admin") {
      const url = request.nextUrl.clone()
      url.pathname = "/"
      return NextResponse.redirect(url)
    }
  }

  // Protect submission routes — must be logged in
  if (isProtectedSubmit && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }

  // Allow password reset flow for anyone (including logged-in users)
  if (pathname === "/forgot-password" || pathname === "/reset-password") {
    return supabaseResponse
  }

  // Redirect logged-in users away from /login and /signup
  if ((pathname === "/login" || pathname === "/signup") && user) {
    const redirectTo = request.nextUrl.searchParams.get("redirect") ?? "/"
    const url = request.nextUrl.clone()
    url.pathname = redirectTo
    url.searchParams.delete("redirect")
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
