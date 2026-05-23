"use client"

import { usePathname } from "next/navigation"
import { Header } from "./header"
import { Footer } from "./footer"
import type { User } from "@supabase/supabase-js"

interface ShellProps {
  children: React.ReactNode
  initialUser?: User | null
}

// Conditionally wraps public pages with Header + Footer.
// Admin routes skip the public shell entirely — they have their own layout.
export function Shell({ children, initialUser }: ShellProps) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith("/admin")

  if (isAdmin) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header initialUser={initialUser} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
