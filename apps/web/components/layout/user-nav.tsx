"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { signOutAction } from "@/lib/actions/auth"
import type { User } from "@supabase/supabase-js"
import { Radio, LogOut, LayoutDashboard, User2, Shield } from "lucide-react"

interface UserNavProps {
  initialUser?: User | null
}

export function UserNav({ initialUser }: UserNavProps) {
  const [user, setUser]       = useState<User | null>(initialUser ?? null)
  const [isAdmin, setIsAdmin] = useState(
    initialUser?.user_metadata?.role === "admin"
  )
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()

    // Sync state when server re-renders with updated initialUser
    // (e.g. after sign-in/sign-out navigation)
    setUser(initialUser ?? null)
    if (initialUser?.user_metadata?.role === "admin") {
      setIsAdmin(true)
    } else if (initialUser) {
      supabase
        .from("user_profiles")
        .select("role")
        .eq("id", initialUser.id)
        .single()
        .then(({ data: profile }) => {
          setIsAdmin(profile?.role === "admin")
        })
    } else {
      setIsAdmin(false)
    }

    // Subscribe to live auth changes (sign-in from another tab, token refresh, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const sessionUser = session?.user ?? null
        setUser(sessionUser)

        if (!sessionUser) {
          setIsAdmin(false)
          return
        }

        if (sessionUser.user_metadata?.role === "admin") {
          setIsAdmin(true)
        } else {
          supabase
            .from("user_profiles")
            .select("role")
            .eq("id", sessionUser.id)
            .single()
            .then(({ data: profile }) => {
              setIsAdmin(profile?.role === "admin")
            })
        }
      }
    )

    return () => subscription.unsubscribe()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialUser?.id])

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  if (!user) {
    return (
      <Link
        href="/login"
        className="rounded-full border border-white/30 px-3 py-1 text-xs font-semibold text-white/90 transition hover:border-white/60 hover:text-white"
      >
        Sign In
      </Link>
    )
  }

  const initials =
    (user.user_metadata?.full_name as string | undefined)
      ?.split(" ")
      .map((w: string) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ||
    user.email?.[0]?.toUpperCase() ||
    "U"

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white hover:bg-white/30 transition"
        aria-label="User menu"
      >
        {initials}
      </button>

      {/* Dropdown */}
      <div
        className={`absolute right-0 top-9 z-50 w-48 rounded-xl border bg-popover shadow-lg origin-top-right transition-all duration-150 ease-out ${
          open
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div className="border-b px-3 py-2.5">
          <p className="flex items-center gap-1 truncate text-xs font-semibold text-foreground">
            {isAdmin && <Shield size={11} className="text-primary" />}
            {isAdmin ? "Admin" : (user.user_metadata?.full_name || "Community Member")}
          </p>
          <p className="truncate text-[11px] text-muted-foreground">{user.email}</p>
        </div>

        <div className="py-1">
          <Link
            href="/my-stuff"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
          >
            <LayoutDashboard size={13} />
            My Stuff
          </Link>

          <Link
            href="/my-stuff/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <User2 size={13} />
            Profile
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-primary hover:bg-muted transition-colors"
            >
              <Radio size={13} />
              Newsroom
            </Link>
          )}

          <div className="my-1 border-t" />

          <form action={signOutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:bg-muted hover:text-destructive transition-colors"
            >
              <LogOut size={13} />
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
