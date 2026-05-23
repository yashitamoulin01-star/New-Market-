"use client"

import { useActionState, Suspense } from "react"
import { useFormStatus } from "react-dom"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { signInAction, type AuthState } from "@/lib/actions/auth"
import { Radio } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

const initialState: AuthState = {}

function SubmitButton() {
  const { pending } = useFormStatus()
  const { lang } = useLanguage()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
    >
      {pending
        ? (lang === "hi" ? "साइन इन हो रहा है…" : "Signing in…")
        : (lang === "hi" ? "साइन इन करें" : "Sign In")}
    </button>
  )
}

function LoginForm() {
  const [state, action] = useActionState(signInAction, initialState)
  const searchParams = useSearchParams()
  const redirectTo   = searchParams.get("redirect") ?? "/"
  const registered   = searchParams.get("registered") === "1"
  const { lang } = useLanguage()
  const hi = lang === "hi"

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-3 flex justify-center">
            <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
              <Radio size={16} className="text-primary" />
              <span className="text-sm font-bold text-primary">
                {hi ? "न्यूमार्केट.co.in" : "NewMarket.co.in"}
              </span>
            </div>
          </div>
          <h1 className="font-heading text-2xl font-bold">
            {hi ? "वापसी पर स्वागत है" : "Welcome back"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {hi ? "अपने कम्युनिटी खाते में साइन इन करें" : "Sign in to your community account"}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          {registered && (
            <div className="mb-4 rounded-lg bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
              {hi ? "खाता बन गया! अब साइन इन करें।" : "Account created! You can now sign in."}
            </div>
          )}

          {state.error && (
            <div className="mb-4 rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
              {state.error}
            </div>
          )}

          <form action={action} className="space-y-4">
            <input type="hidden" name="redirect" value={redirectTo} />

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium">
                {hi ? "ईमेल पता" : "Email address"}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium">
                {hi ? "पासवर्ड" : "Password"}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition"
              />
            </div>

            <SubmitButton />
          </form>

          <div className="mt-3 text-center">
            <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              {hi ? "पासवर्ड भूल गए?" : "Forgot password?"}
            </Link>
          </div>
        </div>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          {hi ? "न्यूमार्केट में नए हैं? " : "New to New Market? "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            {hi ? "खाता बनाएँ" : "Create an account"}
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
