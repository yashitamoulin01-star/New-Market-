import type { Metadata } from "next"
import { TermsContent } from "./content"

export const metadata: Metadata = {
  title: "Terms of Service — NewMarket.co.in",
  description: "Terms and conditions for using NewMarket.co.in, the digital platform of New Market, Bhopal.",
}

export default function TermsPage() {
  return <TermsContent />
}
