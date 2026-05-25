import type { Metadata } from "next"
import { GuidelinesContent } from "./content"

export const metadata: Metadata = {
  title: "Community Guidelines & Platform Rules",
  description: "Rules and guidelines for using NewMarket.co.in — the digital hub of New Market, Bhopal.",
}

export default function GuidelinesPage() {
  return <GuidelinesContent />
}
