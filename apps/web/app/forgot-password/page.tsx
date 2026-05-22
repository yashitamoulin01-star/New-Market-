"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import Link from "next/link"
import { Radio, Mail } from "lucide-react"
import { forgotPasswordAction, type AuthState } from "@/lib/actions/auth"
import { useLanguage } from "@/contexts/language-context"

const initialState: AuthState = {}

function SubmitButton() {
  const { pending } = useFormStatus()
  const { lang } = useLanguage()
  const hi = lang === "hi"
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
    >
      {pending
        ? (hi ? "भेजा जा रहा है…" : "Sending…")
        : (hi ? "रीसेट लिंक भेजें" : "Send Reset Link")}
    </button>
  )
}

export default function ForgotPasswordPage() {
  const [state, action] = useActionState(forgotPasswordAction, initialState)
  const { lang } = useLanguage()
  const hi = lang === "hi"

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-3 flex justify-center">
            <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
              <Radio size={16} className="text-primary" />
              <span className="text-sm font-bold text-primary">NewMarket.co.in</span>
            </div>
          </div>
          <h1 className="font-heading text-2xl font-bold">
            {hi ? "पासवर्ड भूल गए?" : "Forgot Password?"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {hi
              ? "अपना ईमेल डालें — हम आपको रीसेट लिंक भेजेंगे"
              : "Enter your email and we'll send you a reset link"}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          {state.success ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <Mail size={22} className="text-emerald-600" />
              </div>
              <p className="mb-1 font-medium">
                {hi ? "लिंक भेज दिया गया!" : "Link sent!"}
              </p>
              <p className="text-sm text-muted-foreground">
                {hi
                  ? "अगर इस ईमेल पर खाता है, तो रीसेट लिंक मिलेगा। अपना इनबॉक्स जाँचें।"
                  : "If an account exists for this email, a reset link has been sent. Check your inbox."}
              </p>
            </div>
          ) : (
            <>
              {state.error && (
                <div className="mb-4 rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                  {state.error}
                </div>
              )}

              <form action={action} className="space-y-4">
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
                    placeholder={hi ? "आपका ईमेल" : "you@example.com"}
                    className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition"
                  />
                </div>
                <SubmitButton />
              </form>
            </>
          )}
        </div>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          {hi ? "याद आ गया? " : "Remembered it? "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            {hi ? "साइन इन करें" : "Sign in"}
          </Link>
        </p>
      </div>
    </div>
  )
}
