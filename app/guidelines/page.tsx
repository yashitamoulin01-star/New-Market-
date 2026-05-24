import type { Metadata } from "next"
import Link from "next/link"
import { ShieldCheck } from "lucide-react"

export const metadata: Metadata = {
  title: "Community Guidelines & Platform Rules",
  description: "Rules and guidelines for using NewMarket.co.in — the digital hub of New Market, Bhopal.",
}

export default function GuidelinesPage() {
  return (
    <div className="container max-w-3xl py-10">
      <Link href="/" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← Back to Home
      </Link>

      <div className="mb-8 flex items-start gap-3">
        <ShieldCheck size={32} className="text-primary mt-1 shrink-0" />
        <div>
          <h1 className="font-heading text-3xl font-extrabold leading-tight">Community Guidelines &amp; Platform Rules</h1>
          <p className="mt-1 text-sm text-muted-foreground">Effective Date: May 2026 · NewMarket.co.in</p>
        </div>
      </div>

      <div className="prose prose-sm max-w-none dark:prose-invert space-y-8">

        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 px-5 py-4">
          <h2 className="!mt-0 text-amber-900 dark:text-amber-300 font-bold">Important Notice</h2>
          <p className="text-amber-800 dark:text-amber-400 text-sm">
            NewMarket.co.in is a publicly accessible digital platform. By accessing, submitting content to, or using this platform,
            you agree to comply fully with all platform rules, moderation decisions, and applicable laws of India.
            Violation of these rules may result in content removal, permanent account suspension, IP restrictions, reporting to
            relevant authorities, and legal action where applicable.
          </p>
        </div>

        <Section title="Zero Tolerance Policy">
          <p>The following are strictly prohibited and may result in immediate permanent removal without warning:</p>
          <ul>
            {[
              "Fake news or misinformation",
              "Defamation or false allegations",
              "Hate speech or communal content",
              "Religious or political incitement",
              "Threats, intimidation, or harassment",
              "Fraudulent job postings",
              "Scam property listings",
              "Identity impersonation",
              "Uploading copyrighted or stolen material",
              "Explicit, obscene, or illegal content",
              "Doxxing or sharing private information",
              "Coordinated spam or manipulation",
              "Use of bots or automated abuse",
              "Blackmail, extortion, or coercion",
              "Fake reviews or reputation manipulation",
            ].map((item) => <li key={item}>{item}</li>)}
          </ul>
        </Section>

        <Section title="News Publishing Policy">
          <p>All news submissions are subject to editorial review before publication. Users must not submit unverified accusations,
          rumors as facts, politically inflammatory propaganda, misleading media, or AI-generated misinformation.</p>
          <p>Anonymous submissions are permitted; however, identity masking does not exempt users from legal responsibility.
          NewMarket.co.in is not obligated to publish submitted content. Editorial decisions are final.</p>
        </Section>

        <Section title="Job Listing Policy">
          <p>All job postings must represent legitimate employment opportunities. Strictly prohibited:</p>
          <ul>
            {["Fraudulent hiring schemes", "MLM or pyramid schemes", "Fake internships", "Commission-only scams disguised as jobs",
              "Demands for advance payments", "Misrepresentation of salary, role, or company identity"].map(i => <li key={i}>{i}</li>)}
          </ul>
          <p>Repeated violations may result in permanent blacklisting.</p>
        </Section>

        <Section title="Property Listing Policy">
          <p>Users must ensure all property information is accurate, lawful, and authorized. Prohibited: fake advertisements,
          misrepresentation of ownership, fraudulent pricing, duplicate spam listings, and illegal land transactions.</p>
          <p>NewMarket.co.in does not guarantee authenticity of listings. Fraudulent activity may be reported to law enforcement.</p>
        </Section>

        <Section title="Business Directory Policy">
          <p>Businesses must provide truthful and verifiable information. Prohibited: fake listings, impersonation, false verification
          claims, fake ratings, and uploading copyrighted media without authorization. Verified status may be revoked at any time.</p>
        </Section>

        <Section title="Intellectual Property & Copyright">
          <p>Users may only upload content they legally own or are authorized to use — including images, videos, logos, articles,
          and business branding. Copyright infringement complaints result in immediate takedown, account suspension, and potential
          legal escalation. Repeat offenders will be permanently restricted.</p>
        </Section>

        <Section title="Privacy & User Safety">
          <p>Users must not publish personal addresses, government ID documents, banking information, private phone numbers, or
          other sensitive personal information without consent. Doxxing, stalking, and privacy invasion will result in immediate
          enforcement action.</p>
        </Section>

        <Section title="Platform Security & Abuse">
          <p>Any attempt to compromise platform integrity is strictly prohibited — including unauthorized access attempts,
          scraping, bot activity, API abuse, malware distribution, spam automation, and phishing attempts. NewMarket.co.in
          reserves the right to cooperate with cybersecurity investigators and law enforcement agencies.</p>
        </Section>

        <Section title="Moderation Rights">
          <p>NewMarket.co.in maintains full discretionary moderation authority. Administrators may remove content, restrict
          visibility, suspend or terminate accounts, disable submissions, and block IP addresses or devices. Moderation actions
          may occur without prior notice. Users do not possess an automatic right to publication, visibility, or reinstatement.</p>
        </Section>

        <Section title="Disclaimer of Liability">
          <p>User-generated content reflects the views and actions of individual users and not NewMarket.co.in. While moderation
          measures are implemented, NewMarket.co.in does not guarantee the accuracy, legality, or reliability of user-submitted
          content. Users engage with listings and advertisers at their own discretion and risk.</p>
        </Section>

        <Section title="Legal Compliance">
          <p>Users must comply with all applicable laws and regulations of India. Illegal activities including fraud, impersonation,
          cyber abuse, threats, and unlawful transactions may be reported to relevant authorities. NewMarket.co.in reserves the
          right to cooperate fully with lawful investigations and legal requests.</p>
        </Section>

        <div className="rounded-xl border bg-card px-5 py-4 text-sm text-muted-foreground">
          <strong className="block mb-1 text-foreground">Final Statement</strong>
          NewMarket.co.in is intended to operate as a trusted and professionally moderated public platform for the community of
          Bhopal. Platform safety, credibility, legal compliance, and responsible participation take priority over unrestricted
          publishing access. Continued use of this platform constitutes acceptance of all applicable policies and moderation decisions.
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-heading text-xl font-bold mb-3 text-foreground">{title}</h2>
      <div className="space-y-2 text-sm text-foreground/85 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
        {children}
      </div>
    </div>
  )
}
