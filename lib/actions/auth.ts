"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/")
}

export interface AuthState {
  error?: string
  success?: boolean
  message?: string
}

function friendlyAuthError(msg: string): string {
  const m = msg.toLowerCase()
  if (m.includes("invalid login credentials") || m.includes("invalid credentials"))
    return "Incorrect email or password. Please try again."
  if (m.includes("email not confirmed"))
    return "Please verify your email before signing in."
  if (m.includes("user already registered") || m.includes("already been registered"))
    return "An account with this email already exists. Try signing in instead."
  if (m.includes("password should be at least"))
    return "Password must be at least 6 characters."
  if (m.includes("unable to validate email"))
    return "Please enter a valid email address."
  if (m.includes("email rate limit") || m.includes("over email send rate limit"))
    return "Too many attempts. Please wait a few minutes before trying again."
  if (m.includes("token has expired") || m.includes("token is invalid"))
    return "This link has expired. Please request a new one."
  return msg
}

export async function signInAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email    = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")

  if (!email || !password)
    return { error: "Email and password are required." }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { error: friendlyAuthError(error.message) }

  redirect(String(formData.get("redirect") || "/"))
}

export async function signUpAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email    = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")
  const name     = String(formData.get("name") ?? "").trim()

  if (!email || !password || !name)
    return { error: "All fields are required." }
  if (password.length < 6)
    return { error: "Password must be at least 6 characters." }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name, role: "user" } },
  })

  if (error) return { error: friendlyAuthError(error.message) }

  redirect("/login?registered=1")
}

export async function forgotPasswordAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim()

  if (!email) return { error: "Please enter your email address." }

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const resetUrl = `${siteUrl}/reset-password`

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: resetUrl,
  })

  if (error) return { error: friendlyAuthError(error.message) }

  return {
    success: true,
    message: "If an account exists for this email, a password reset link has been sent.",
  }
}

export async function resetPasswordAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const password = String(formData.get("password") ?? "")
  const confirm  = String(formData.get("confirm") ?? "")

  if (!password || !confirm) return { error: "Both fields are required." }
  if (password.length < 6) return { error: "Password must be at least 6 characters." }
  if (password !== confirm) return { error: "Passwords do not match." }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) return { error: friendlyAuthError(error.message) }

  return { success: true, message: "Password updated successfully." }
}
