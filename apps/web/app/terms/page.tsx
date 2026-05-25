import type { Metadata } from "next"
import Link from "next/link"
import { FileText } from "lucide-react"

export const metadata: Metadata = {
  title: "Terms of Service — NewMarket.co.in",
  description: "Terms and conditions for using NewMarket.co.in, the digital platform of New Market, Bhopal.",
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 font-heading text-lg font-bold text-foreground">{title}</h2>
      <div className="space-y-2 text-sm text-foreground/75 leading-relaxed">{children}</div>
    </section>
  )
}

export default function TermsPage() {
  return (
    <div className="container max-w-3xl py-10">
      <Link href="/" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← Back to Home
      </Link>

      <div className="mb-8 flex items-start gap-3">
        <FileText size={32} className="text-primary mt-1 shrink-0" />
        <div>
          <h1 className="font-heading text-3xl font-extrabold leading-tight">Terms of Service</h1>
          <p className="mt-1 text-sm text-muted-foreground">Effective Date: May 2026 · NewMarket.co.in</p>
        </div>
      </div>

      <div className="space-y-8">
        <div className="rounded-xl border border-primary/20 bg-primary/5 px-5 py-4 text-sm text-foreground/80">
          By accessing or using NewMarket.co.in, you agree to be bound by these Terms of Service and all applicable laws. If you do not agree, please stop using the platform immediately.
        </div>

        <Section title="1. About the Platform">
          <p>NewMarket.co.in is a community-driven digital platform serving the New Market area of Bhopal, Madhya Pradesh, India. It provides local news, job listings, shop directories, property listings, and election information.</p>
          <p>The platform is operated independently and is not affiliated with any government body, municipal corporation, or official trade association.</p>
        </Section>

        <Section title="2. User Accounts">
          <p>You may create a free account to submit content, save listings, and participate in community features. You are responsible for maintaining the confidentiality of your account credentials.</p>
          <p>You must not create accounts for others without their permission, use another person's account, or create multiple accounts for the same person.</p>
          <p>We reserve the right to suspend or terminate accounts that violate these terms without prior notice.</p>
        </Section>

        <Section title="3. Content Submission">
          <p>When you submit content (news articles, job listings, shop entries, property listings, or any other material), you grant NewMarket.co.in a non-exclusive, royalty-free, worldwide licence to use, display, distribute, modify, and promote that content on the platform and in related communications.</p>
          <p>You represent that you own or have the necessary rights to the content you submit and that it does not infringe any third-party intellectual property rights.</p>
          <p>All submissions are subject to review and approval. Submission does not guarantee publication.</p>
        </Section>

        <Section title="4. Editorial Rights">
          <p>NewMarket.co.in and its editorial team reserve the right to:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Review, edit, reformat, shorten, or correct any submitted content before or after publication</li>
            <li>Reject any content without providing a reason</li>
            <li>Remove or unpublish content at any time</li>
            <li>Add or change labels, categories, and metadata</li>
            <li>Feature or promote content at our discretion</li>
          </ul>
          <p>These actions may be taken without prior notice to the submitter.</p>
        </Section>

        <Section title="5. Prohibited Content & Conduct">
          <p>You agree not to submit or engage in:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>False, misleading, or fabricated information</li>
            <li>Content that harasses, threatens, or defames individuals or groups</li>
            <li>Hate speech, discrimination based on caste, religion, gender, nationality, or disability</li>
            <li>Spam, unsolicited commercial messages, or duplicate submissions</li>
            <li>Content that violates any Indian law (including the IT Act 2000, IPC, and any applicable state laws)</li>
            <li>Copyright-infringing material without authorisation</li>
            <li>Attempts to compromise platform security or manipulate rankings/views</li>
          </ul>
        </Section>

        <Section title="6. Intellectual Property">
          <p>All original content created by NewMarket.co.in — including editorial articles, design elements, logos, and platform code — is the exclusive property of NewMarket.co.in and may not be reproduced without written permission.</p>
          <p>User-submitted content remains the property of the submitter, subject to the licence granted above.</p>
        </Section>

        <Section title="7. Disclaimer of Warranties">
          <p>NewMarket.co.in is provided "as is" without warranties of any kind. We do not guarantee the accuracy, completeness, or timeliness of any content on the platform. We are not responsible for actions taken based on information found here.</p>
          <p>Job listings, shop details, and property information are submitted by users. NewMarket.co.in does not verify all claims and accepts no liability for disputes arising from user-submitted listings.</p>
        </Section>

        <Section title="8. Limitation of Liability">
          <p>To the maximum extent permitted by law, NewMarket.co.in shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform or reliance on any content herein.</p>
        </Section>

        <Section title="9. Changes to Terms">
          <p>We may update these Terms from time to time. Continued use of the platform after changes constitutes your acceptance of the revised Terms. The effective date at the top of this page will reflect when changes were last made.</p>
        </Section>

        <Section title="10. Governing Law">
          <p>These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Bhopal, Madhya Pradesh.</p>
        </Section>

        <Section title="11. Contact">
          <p>For questions about these Terms, contact us at the email address listed on our platform or through the contact form on the website.</p>
        </Section>

        <div className="rounded-xl border bg-muted/30 p-5 text-center space-y-2">
          <p className="text-sm text-muted-foreground">Related policies</p>
          <div className="flex justify-center gap-4 text-sm font-medium">
            <Link href="/guidelines" className="text-primary hover:underline">Community Guidelines</Link>
            <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
