import type { Metadata } from "next"
import Link from "next/link"
import { Lock } from "lucide-react"

export const metadata: Metadata = {
  title: "Privacy Policy — NewMarket.co.in",
  description: "How NewMarket.co.in collects, uses, and protects your personal information.",
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 font-heading text-lg font-bold text-foreground">{title}</h2>
      <div className="space-y-2 text-sm text-foreground/75 leading-relaxed">{children}</div>
    </section>
  )
}

export default function PrivacyPage() {
  return (
    <div className="container max-w-3xl py-10">
      <Link href="/" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← Back to Home
      </Link>

      <div className="mb-8 flex items-start gap-3">
        <Lock size={32} className="text-primary mt-1 shrink-0" />
        <div>
          <h1 className="font-heading text-3xl font-extrabold leading-tight">Privacy Policy</h1>
          <p className="mt-1 text-sm text-muted-foreground">Effective Date: May 2026 · NewMarket.co.in</p>
        </div>
      </div>

      <div className="space-y-8">
        <div className="rounded-xl border border-primary/20 bg-primary/5 px-5 py-4 text-sm text-foreground/80">
          Your privacy matters to us. This policy explains what data we collect, how we use it, and your rights regarding your personal information.
        </div>

        <Section title="1. Information We Collect">
          <p><strong>Account information:</strong> When you create an account, we collect your name and email address. These are used to identify you and send platform-related communications.</p>
          <p><strong>Submission data:</strong> Content you submit (articles, listings, etc.) along with your contact details (name, email, phone) as provided in submission forms.</p>
          <p><strong>Usage data:</strong> We collect basic analytics such as page views, browser type, and approximate location (city-level). We do not sell this data.</p>
          <p><strong>Technical data:</strong> IP address, device type, and browser data collected automatically when you use the platform, used for security and abuse prevention.</p>
        </Section>

        <Section title="2. How We Use Your Information">
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>To display your submitted content on the platform (unless submitted anonymously)</li>
            <li>To contact you regarding your submissions or account</li>
            <li>To moderate content and enforce community guidelines</li>
            <li>To improve platform performance and user experience</li>
            <li>To comply with legal obligations under Indian law</li>
          </ul>
          <p>We do not sell, rent, or share your personal information with third parties for marketing purposes.</p>
        </Section>

        <Section title="3. Anonymous Submissions">
          <p>News submissions may be made anonymously. In this case, your name will not be displayed publicly. However, your email address is still collected for moderation purposes and is kept private.</p>
          <p>Even anonymous submissions are traceable to an IP address for legal compliance and abuse prevention.</p>
        </Section>

        <Section title="4. Data Storage">
          <p>Your data is stored securely using Supabase (PostgreSQL database hosted on AWS infrastructure). Data is stored in servers that comply with applicable data protection standards.</p>
          <p>We retain account and submission data for as long as the account is active or as required for legal compliance. Deleted content may remain in backups for up to 30 days.</p>
        </Section>

        <Section title="5. Cookies">
          <p>We use essential cookies to keep you logged in and remember your preferences (such as language and theme settings). These are strictly necessary and cannot be disabled without affecting platform functionality.</p>
          <p>We do not use advertising cookies or cross-site tracking cookies.</p>
        </Section>

        <Section title="6. Third-Party Services">
          <p>The platform uses the following third-party services:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>Supabase</strong> — database and authentication</li>
            <li><strong>Vercel</strong> — hosting and deployment</li>
            <li><strong>Google / YouTube embeds</strong> — where applicable, subject to Google's privacy policy</li>
          </ul>
          <p>These services have their own privacy policies and we are not responsible for their data practices.</p>
        </Section>

        <Section title="7. Your Rights">
          <p>Under applicable law, you have the right to:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your account and associated personal data</li>
            <li>Withdraw consent for data processing where consent is the legal basis</li>
          </ul>
          <p>To exercise these rights, contact us through the platform. We will respond within a reasonable timeframe.</p>
        </Section>

        <Section title="8. Children's Privacy">
          <p>NewMarket.co.in is not directed at children under 13. We do not knowingly collect personal information from minors. If you believe a child has submitted data to our platform, please contact us for removal.</p>
        </Section>

        <Section title="9. Changes to This Policy">
          <p>We may update this Privacy Policy periodically. Changes will be reflected by updating the effective date above. Continued use of the platform after changes constitutes acceptance of the updated policy.</p>
        </Section>

        <Section title="10. Contact">
          <p>For privacy-related queries or data requests, please contact us through the platform's contact options or email address listed on the website.</p>
        </Section>

        <div className="rounded-xl border bg-muted/30 p-5 text-center space-y-2">
          <p className="text-sm text-muted-foreground">Related policies</p>
          <div className="flex justify-center gap-4 text-sm font-medium">
            <Link href="/guidelines" className="text-primary hover:underline">Community Guidelines</Link>
            <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
