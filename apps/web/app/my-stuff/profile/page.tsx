import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { T } from "@/components/ui/t"
import { User2, Mail, Calendar } from "lucide-react"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { FontSizeToolbar } from "@/components/ui/font-size-toolbar"

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login?redirect=/my-stuff/profile")

  const name = (user.user_metadata?.full_name as string | undefined) ?? ""
  const email = user.email ?? ""
  const role = (user.user_metadata?.role as string | undefined) ?? "user"
  const joinedAt = new Date(user.created_at).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  })

  return (
    <div className="container max-w-xl py-8">
      <h1 className="mb-6 text-2xl font-bold">
        <T en="Profile" hi="प्रोफ़ाइल" />
      </h1>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        {/* Avatar */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
            {name ? name.charAt(0).toUpperCase() : email.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold">{name || "Community Member"}</p>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
        </div>

        {/* Details */}
        <dl className="space-y-4">
          <div className="flex items-center gap-3">
            <User2 size={15} className="shrink-0 text-muted-foreground" />
            <div>
              <dt className="text-xs text-muted-foreground">
                <T en="Display Name" hi="नाम" />
              </dt>
              <dd className="text-sm font-medium">{name || "—"}</dd>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Mail size={15} className="shrink-0 text-muted-foreground" />
            <div>
              <dt className="text-xs text-muted-foreground">
                <T en="Email" hi="ईमेल" />
              </dt>
              <dd className="text-sm font-medium">{email}</dd>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Calendar size={15} className="shrink-0 text-muted-foreground" />
            <div>
              <dt className="text-xs text-muted-foreground">
                <T en="Member since" hi="सदस्य बने" />
              </dt>
              <dd className="text-sm font-medium">{joinedAt}</dd>
            </div>
          </div>

          {role === "admin" && (
            <div className="rounded-lg bg-primary/5 px-3 py-2">
              <p className="text-xs font-semibold text-primary">
                <T en="Admin Account" hi="एडमिन अकाउंट" />
              </p>
            </div>
          )}
        </dl>
      </div>

      <div className="mt-6 rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold">
          <T en="Appearance Settings" hi="दिखावट सेटिंग्स" />
        </h2>
        <div className="flex flex-col gap-4">
          <div>
            <div className="mb-2">
              <p className="font-medium text-sm"><T en="Font Size" hi="फ़ॉन्ट आकार" /></p>
              <p className="text-xs text-muted-foreground"><T en="Adjust the text size across the site." hi="पूरी साइट में टेक्स्ट का आकार बदलें।" /></p>
            </div>
            <FontSizeToolbar />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm"><T en="Dark Theme" hi="डार्क थीम" /></p>
              <p className="text-xs text-muted-foreground"><T en="Toggle between light and dark mode." hi="लाइट और डार्क मोड के बीच टॉगल करें।" /></p>
            </div>
            <div className="rounded-full bg-primary/10 p-1">
              <div className="[&>button]:bg-white [&>button]:text-primary [&>button]:border-primary/20 hover:[&>button]:bg-primary/5">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        <T
          en="To change your name or password, use the forgot password flow."
          hi="नाम या पासवर्ड बदलने के लिए forgot password का उपयोग करें।"
        />
      </p>
    </div>
  )
}
