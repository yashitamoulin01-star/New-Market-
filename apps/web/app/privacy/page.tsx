import type { Metadata } from "next"
import { PrivacyContent } from "./content"

export const metadata: Metadata = {
  title: "Privacy Policy — NewMarket.co.in",
  description: "How NewMarket.co.in collects, uses, and protects your personal information.",
}

export default function PrivacyPage() {
  return <PrivacyContent />
}
