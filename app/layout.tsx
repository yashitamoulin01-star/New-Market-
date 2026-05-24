import type { Metadata } from "next"
import { Inter, Plus_Jakarta_Sans, Noto_Sans_Devanagari } from "next/font/google"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { LanguageProvider } from "@/contexts/language-context"
import { FontSizeProvider } from "@/contexts/font-size-context"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jakarta.variable} ${devanagari.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <LanguageProvider>
            <FontSizeProvider>
              <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
            </FontSizeProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
