import Link from "next/link"
import { T } from "@/components/ui/t"

export function Footer() {
  return (
    <footer className="border-t section-alt">
      <div className="container py-10">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <h3 className="mb-3 font-bold text-primary">
              <T en="NewMarket.co.in" hi="न्यू मार्केट.co.in" />
            </h3>
            <p className="text-xs leading-relaxed text-muted-foreground">
              <T
                en="The digital identity of New Market, Bhopal. Connecting businesses, workers, and citizens."
                hi="न्यू मार्केट, भोपाल की Digital पहचान। व्यापारियों, कामगारों और नागरिकों को जोड़ने का मंच।"
              />
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">
              <T en="Explore" hi="जानें" />
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/news" className="transition-colors hover:text-foreground">
                  <T en="Local News" hi="स्थानीय समाचार" />
                </Link>
              </li>
              <li>
                <Link href="/jobs" className="transition-colors hover:text-foreground">
                  <T en="Job Vacancies" hi="नौकरियाँ" />
                </Link>
              </li>
              <li>
                <Link href="/shops" className="transition-colors hover:text-foreground">
                  <T en="Shop Directory" hi="दुकान डायरेक्टरी" />
                </Link>
              </li>
              <li>
                <Link href="/property" className="transition-colors hover:text-foreground">
                  <T en="Property Listings" hi="संपत्ति लिस्टिंग" />
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">
              <T en="Submit" hi="सबमिट" />
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/news/submit" className="transition-colors hover:text-foreground">
                  <T en="Submit News" hi="समाचार भेजें" />
                </Link>
              </li>
              <li>
                <Link href="/jobs/post" className="transition-colors hover:text-foreground">
                  <T en="Post a Job" hi="नौकरी पोस्ट करें" />
                </Link>
              </li>
              <li>
                <Link href="/shops/add" className="transition-colors hover:text-foreground">
                  <T en="List Your Shop" hi="दुकान जोड़ें" />
                </Link>
              </li>
              <li>
                <Link href="/property/list" className="transition-colors hover:text-foreground">
                  <T en="List Property" hi="संपत्ति लिस्ट करें" />
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">
              <T en="Location" hi="स्थान" />
            </h4>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>New Market, Bhopal</li>
              <li>Madhya Pradesh, India</li>
              <li className="pt-2">
                <Link href="/guidelines" className="transition-colors hover:text-foreground">
                  <T en="Community Guidelines" hi="सामुदायिक नियम" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} <T en="NewMarket.co.in" hi="न्यू मार्केट.co.in" /> —{" "}
          <T en="All rights reserved." hi="सर्वाधिकार सुरक्षित।" />
        </div>
      </div>
    </footer>
  )
}
