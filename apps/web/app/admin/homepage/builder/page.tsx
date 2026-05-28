import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DEFAULT_LAYOUT_CONFIG, mergeLayoutConfig, type LayoutConfig } from "@/lib/supabase/layout-config"
import { BuilderClient } from "./builder-client"

async function getLayoutConfig(): Promise<LayoutConfig> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("homepage_settings")
      .select("layout_config")
      .eq("id", 1)
      .maybeSingle()
    if (data?.layout_config) return mergeLayoutConfig(data.layout_config)
    return DEFAULT_LAYOUT_CONFIG
  } catch {
    return DEFAULT_LAYOUT_CONFIG
  }
}

export const metadata = { title: "Visual Layout Builder — Admin" }

export default async function BuilderPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/admin/login")

  const layoutConfig = await getLayoutConfig()

  return <BuilderClient initialConfig={layoutConfig} />
}
