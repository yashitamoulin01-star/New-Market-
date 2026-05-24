import { createClient } from "@supabase/supabase-js"

// Module-level singleton — one connection reused across all server requests.
// Used for public read-only queries that don't need auth/cookies.
export const supabasePublic = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: { persistSession: false },
    global: { fetch: (url, opts) => fetch(url, { ...opts, next: { revalidate: 60 } }) },
  }
)
