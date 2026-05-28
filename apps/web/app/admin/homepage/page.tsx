import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DEFAULT_SETTINGS, type HomepageSettings } from "@/lib/supabase/homepage-settings"
import { DEFAULT_LAYOUT_CONFIG, mergeLayoutConfig, type LayoutConfig } from "@/lib/supabase/layout-config"
import { ControlCenter } from "./control-center"

async function getData(): Promise<{ settings: HomepageSettings; layoutConfig: LayoutConfig }> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("homepage_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle()

    if (!data) return { settings: DEFAULT_SETTINGS, layoutConfig: DEFAULT_LAYOUT_CONFIG }

    const settings = { ...DEFAULT_SETTINGS, ...data } as HomepageSettings
    const layoutConfig = data.layout_config
      ? mergeLayoutConfig(data.layout_config)
      : DEFAULT_LAYOUT_CONFIG

    return { settings, layoutConfig }
  } catch {
    return { settings: DEFAULT_SETTINGS, layoutConfig: DEFAULT_LAYOUT_CONFIG }
  }
}

export const metadata = { title: "Homepage Control Center — Admin" }

export default async function AdminHomepagePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/admin/login")

  const { settings, layoutConfig } = await getData()

  return <ControlCenter settings={settings} layoutConfig={layoutConfig} />
}
