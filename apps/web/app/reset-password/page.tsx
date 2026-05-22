import Link from "next/link"
import { Radio } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { ResetPasswordForm } from "./reset-form"

interface PageProps {
  searchParams: Promise<{ code?: string; error?: string; error_description?: string }>
}

export const metadata = {
  title: "Reset Password — New Market",
}

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const params = await searchParams
  const { code, error: authError } = params

  let exchangeError: string | null = null

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) exchangeError = "This reset link has expired or is invalid. Please request a new one."
  } else if (authError) {
    exchangeError = "This reset link is invalid. Please request a new one."
  }

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
          <h1 className="font-heading text-2xl font-bold">Reset Password</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose a new password for your account
          </p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          {exchangeError ? (
            <div className="text-center">
              <div className="mb-4 rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                {exchangeError}
              </div>
              <Link
                href="/forgot-password"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                Request new link
              </Link>
            </div>
          ) : (
            <ResetPasswordForm />
          )}
        </div>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          Remembered it?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
