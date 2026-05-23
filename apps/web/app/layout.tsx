import type { Metadata } from "next"
import { Inter, Plus_Jakarta_Sans, Noto_Sans_Devanagari, Playfair_Display } from "next/font/google"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { LanguageProvider } from "@/contexts/language-context"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { createClient } from "@/lib/supabase/server"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["500", "600", "700", "800"],
  display: "swap",
})

const devanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-devanagari",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-editorial",
  weight: ["700", "800", "900"],
  display: "swap",
})

export const viewport = {
  colorScheme: "light",
  themeColor: "hsl(350, 78%, 36%)",
}

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://newmarket.co.in"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "NewMarket.co.in — New Market, Bhopal",
    template: "%s | NewMarket.co.in",
  },
  description:
    "The digital hub of New Market, Bhopal. Local news, job vacancies, shop directory, and property listings.",
  keywords: ["New Market Bhopal", "local news", "jobs", "shops", "property", "नई मार्केट", "Bhopal marketplace"],
  authors: [{ name: "NewMarket.co.in" }],
  creator: "NewMarket.co.in",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "NewMarket.co.in",
    title: "NewMarket.co.in — New Market, Bhopal",
    description: "The digital hub of New Market, Bhopal. Local news, jobs, shops, and property listings.",
  },
  twitter: {
    card: "summary",
    title: "NewMarket.co.in — New Market, Bhopal",
    description: "The digital hub of New Market, Bhopal. Local news, jobs, shops, and property listings.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Fetch user server-side so Header renders with correct auth state immediately
  // — eliminates the "Sign In" flash after login
  let initialUser = null
  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    initialUser = data.user
  } catch {
    // fail silently — client-side auth will take over
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jakarta.variable} ${devanagari.variable} ${playfair.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <LanguageProvider>
            <div className="flex min-h-screen flex-col">
              <Header initialUser={initialUser} />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
