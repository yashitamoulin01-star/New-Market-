"use client"

import { useActionState, useState } from "react"
import { useFormStatus } from "react-dom"
import Link from "next/link"
import { signUpAction, type AuthState } from "@/lib/actions/auth"
import { Radio, ShieldCheck } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

const initialState: AuthState = {}

function SubmitButton({ agreed }: { agreed: boolean }) {
  const { pending } = useFormStatus()
  const { lang } = useLanguage()
  return (
    <button
      type="submit"
      disabled={pending || !agreed}
      className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
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
              <span className="text-sm font-bold text-primary">NewMarket.co.in</span>
            </div>
          </div>
          <h1 className="font-heading text-2xl font-bold">
            {hi ? "नई मार्केट से जुड़ें" : "Join New Market"}
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

            {/* Community guidelines agreement */}
            <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-3">
              <label className="flex cursor-pointer items-start gap-2.5">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-primary shrink-0"
                  required
                />
                <span className="text-xs leading-relaxed text-foreground/80">
                  {hi
                    ? <>मैं <Link href="/guidelines" target="_blank" className="font-semibold text-primary hover:underline">सामुदायिक दिशा-निर्देश और नियम</Link> पढ़ चुका/चुकी हूँ और उनसे सहमत हूँ। मैं भारतीय कानूनों का पालन करने और इस प्लेटफॉर्म का जिम्मेदारी से उपयोग करने का वचन देता/देती हूँ।</>
                    : <>I have read and agree to the <Link href="/guidelines" target="_blank" className="font-semibold text-primary hover:underline">Community Guidelines &amp; Platform Rules</Link>. I commit to using this platform responsibly and in compliance with the laws of India.</>
                  }
                </span>
              </label>
              {!agreed && (
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-400">
                  <ShieldCheck size={11} />
                  {hi ? "खाता बनाने से पहले सहमत होना आवश्यक है" : "Agreement required to create an account"}
                </div>
              )}
            </div>

            <SubmitButton agreed={agreed} />
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
