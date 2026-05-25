"use client"

import { useActionState, useState } from "react"
import { useFormStatus } from "react-dom"
import Link from "next/link"
import { signUpAction, type AuthState } from "@/lib/actions/auth"
import { Radio } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

const initialState: AuthState = {}

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus()
  const { lang } = useLanguage()
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
    >
      {pending
        ? (lang === "hi" ? "खाता बन रहा है…" : "Creating account…")
        : (lang === "hi" ? "खाता बनाएँ" : "Create Account")}
    </button>
  )
}

export default function SignUpPage() {
  const [state, action] = useActionState(signUpAction, initialState)
  const { lang } = useLanguage()
  const hi = lang === "hi"
  const [agreed, setAgreed] = useState(false)

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-3 flex justify-center">
            <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
              <Radio size={16} className="text-primary" />
              <span className="text-sm font-bold text-primary">
                {hi ? "न्यू मार्केट.co.in" : "NewMarket.co.in"}
              </span>
            </div>
          </div>
          <h1 className="font-heading text-2xl font-bold">
            {hi ? "न्यू मार्केट से जुड़ें" : "Join New Market"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {hi ? "कम्युनिटी खाता बनाएँ — बिल्कुल मुफ़्त" : "Create a community account — it's free"}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          {state.error && (
            <div className="mb-4 rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
              {state.error}
            </div>
          )}

          <form action={action} className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium">
                {hi ? "आपका नाम" : "Your name"}
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                autoComplete="name"
                placeholder={hi ? "जैसे — रमेश शर्मा" : "e.g. Ramesh Sharma"}
                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition"
              />
            </div>

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
                autoComplete="new-password"
                minLength={6}
                placeholder={hi ? "कम से कम 6 अक्षर" : "At least 6 characters"}
                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition"
              />
            </div>

            <div className="rounded-lg border bg-muted/30 p-3">
              <label className="flex cursor-pointer items-start gap-2.5">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-primary"
                />
                <span className="text-xs text-muted-foreground">
                  {hi ? (
                    <>मैंने{" "}
                      <Link href="/guidelines" target="_blank" className="font-medium text-primary hover:underline">सामुदायिक नियम</Link>
                      {", "}
                      <Link href="/terms" target="_blank" className="font-medium text-primary hover:underline">सेवा की शर्तें</Link>
                      {" और "}
                      <Link href="/privacy" target="_blank" className="font-medium text-primary hover:underline">गोपनीयता नीति</Link>
                      {" पढ़े और स्वीकार करता/करती हूँ।"}
                    </>
                  ) : (
                    <>I have read and agree to the{" "}
                      <Link href="/guidelines" target="_blank" className="font-medium text-primary hover:underline">Community Guidelines</Link>
                      {", "}
                      <Link href="/terms" target="_blank" className="font-medium text-primary hover:underline">Terms</Link>
                      {", and "}
                      <Link href="/privacy" target="_blank" className="font-medium text-primary hover:underline">Privacy Policy</Link>
                      .
                    </>
                  )}
                </span>
              </label>
              {!agreed && (
                <p className="mt-1.5 text-[11px] text-amber-600">
                  {hi ? "आगे बढ़ने के लिए नियम स्वीकार करें।" : "You must agree to the guidelines to create an account."}
                </p>
              )}
            </div>

            <SubmitButton disabled={!agreed} />

            <p className="text-center text-xs text-muted-foreground">
              {hi
                ? "साइन अप करके आप न्यू मार्केट कम्युनिटी में सम्मानपूर्वक योगदान देने के लिए सहमत हैं।"
                : "By signing up you agree to contribute respectfully to the New Market community."}
            </p>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          {hi ? "पहले से खाता है? " : "Already have an account? "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            {hi ? "साइन इन करें" : "Sign in"}
          </Link>
        </p>
      </div>
    </div>
  )
}
