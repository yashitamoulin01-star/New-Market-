"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { resetPasswordAction, type AuthState } from "@/lib/actions/auth"
import { useLanguage } from "@/contexts/language-context"
import { PasswordInput } from "@/components/ui/password-input"

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
        ? (hi ? "अपडेट हो रहा है…" : "Updating…")
        : (hi ? "पासवर्ड अपडेट करें" : "Update Password")}
    </button>
  )
}

export function ResetPasswordForm() {
  const [state, action] = useActionState(resetPasswordAction, initialState)
  const { lang } = useLanguage()
  const hi = lang === "hi"

  if (state.success) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 size={22} className="text-emerald-600" />
        </div>
        <p className="mb-1 font-medium">
          {hi ? "पासवर्ड बदल गया!" : "Password updated!"}
        </p>
        <p className="mb-4 text-sm text-muted-foreground">
          {hi
            ? "आप अब नए पासवर्ड से साइन इन कर सकते हैं।"
            : "You can now sign in with your new password."}
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          {hi ? "साइन इन करें" : "Sign In"}
        </Link>
      </div>
    )
  }

  return (
    <>
      {state.error && (
        <div className="mb-4 rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <form action={action} className="space-y-4">
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            {hi ? "नया पासवर्ड" : "New password"}
          </label>
          <PasswordInput
            id="password"
            name="password"
            required
            minLength={6}
            autoComplete="new-password"
            placeholder={hi ? "कम से कम 6 अक्षर" : "At least 6 characters"}
            className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition"
          />
        </div>

        <div>
          <label htmlFor="confirm" className="mb-1 block text-sm font-medium">
            {hi ? "पासवर्ड की पुष्टि करें" : "Confirm new password"}
          </label>
          <PasswordInput
            id="confirm"
            name="confirm"
            required
            minLength={6}
            autoComplete="new-password"
            placeholder={hi ? "दोबारा डालें" : "Re-enter password"}
            className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition"
          />
        </div>

        <SubmitButton />
      </form>
    </>
  )
}
