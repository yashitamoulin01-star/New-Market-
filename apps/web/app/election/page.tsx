import Link from "next/link"
import { Vote, Trophy, Calendar, Users, FileText, Clock, ChevronRight, Shield } from "lucide-react"
import { T } from "@/components/ui/t"

const POSTS = [
  { hi: "अध्यक्ष",           en: "President" },
  { hi: "उपाध्यक्ष",         en: "Vice President" },
  { hi: "सचिव",              en: "Secretary" },
  { hi: "कोषाध्यक्ष",        en: "Treasurer" },
  { hi: "कार्यकारिणी सदस्य", en: "Executive Committee Member" },
]

const PAST_ELECTIONS = [
  { year: "2024", status: "completed" as const },
  { year: "2023", status: "completed" as const },
  { year: "2022", status: "completed" as const },
]

export default function ElectionPage() {
  return (
    <div className="bg-[#f7f4f0] min-h-screen">
      {/* Header banner */}
      <div
        className="border-b py-8"
        style={{ background: "linear-gradient(135deg, hsl(350,80%,34%) 0%, hsl(350,70%,28%) 100%)" }}
      >
        <div className="container max-w-4xl">
          <div className="mb-3 flex items-center gap-2">
            <Vote size={18} className="text-primary-foreground/70" />
            <span className="text-xs font-bold uppercase tracking-widest text-primary-foreground/60">
              <T en="Official Election Hub" hi="आधिकारिक चुनाव हब" />
            </span>
          </div>
          <h1 className="font-heading text-3xl font-extrabold text-white sm:text-4xl">
            <T en="Vyapari Mahasangh Elections" hi="व्यापारी महासंघ चुनाव" />
          </h1>
          <p className="mt-2 text-sm text-white/60">
            <T
              en="New Market Vyapari Mahasangh, Bhopal — Annual Officer Elections"
              hi="नई मार्केट व्यापारी महासंघ, भोपाल — वार्षिक पदाधिकारी चुनाव"
            />
          </p>

          {/* Status badge */}
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2">
            <Clock size={13} className="text-amber-300" />
            <span className="text-sm font-semibold text-white">
              <T en="Next Election: Coming Soon" hi="अगला चुनाव: शीघ्र आ रहा है" />
            </span>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Main content */}
          <div className="space-y-6 lg:col-span-2">

            {/* Election posts */}
            <section className="rounded-xl border bg-card p-5 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 font-heading text-base font-bold">
                <Trophy size={15} className="text-amber-500" />
                <T en="Election Posts" hi="चुनाव पद" />
              </h2>
              <div className="space-y-2">
                {POSTS.map((post) => (
                  <div key={post.en} className="flex items-center justify-between rounded-lg border bg-background px-4 py-3">
                    <span className="text-sm font-medium">
                      <T en={post.en} hi={post.hi} />
                    </span>
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
                      <T en="1 seat" hi="1 सीट" />
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Voting process */}
            <section className="rounded-xl border bg-card p-5 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 font-heading text-base font-bold">
                <Shield size={15} className="text-primary" />
                <T en="How Voting Works" hi="मतदान प्रक्रिया" />
              </h2>
              <ol className="space-y-3">
                {[
                  { en: "Register with your mobile number",             hi: "अपने मोबाइल नंबर से रजिस्टर करें" },
                  { en: "Receive OTP on your phone",                    hi: "फ़ोन पर OTP प्राप्त करें" },
                  { en: "Verify and access voting booth",               hi: "सत्यापित करें और मतदान करें" },
                  { en: "One phone number = one vote, securely locked", hi: "एक नंबर = एक वोट, सुरक्षित रूप से लॉक" },
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                    <span className="pt-0.5 text-sm">
                      <T en={step.en} hi={step.hi} />
                    </span>
                  </li>
                ))}
              </ol>
            </section>

            {/* Past elections archive */}
            <section className="rounded-xl border bg-card p-5 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 font-heading text-base font-bold">
                <FileText size={15} className="text-muted-foreground" />
                <T en="Past Elections" hi="पिछले चुनाव" />
              </h2>
              <ul className="divide-y">
                {PAST_ELECTIONS.map(({ year }) => (
                  <li key={year} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <Calendar size={14} className="text-muted-foreground" />
                      <span className="text-sm font-medium">
                        <T en={`Election ${year}`} hi={`चुनाव ${year}`} />
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
                        <T en="Completed" hi="संपन्न" />
                      </span>
                      <button className="text-[11px] text-muted-foreground hover:text-primary transition-colors">
                        <T en="View Results" hi="परिणाम देखें" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-center text-[11px] text-muted-foreground">
                <T en="Full archive coming soon" hi="पूरा अभिलेख शीघ्र आएगा" />
              </p>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Status card */}
            <div className="rounded-xl border bg-card p-4 shadow-sm">
              <h3 className="mb-3 text-sm font-bold">
                <T en="Election Status" hi="चुनाव स्थिति" />
              </h3>
              <div className="space-y-2 text-xs">
                {[
                  { en: "Voting",      hi: "मतदान",        status: "inactive" },
                  { en: "Nominations", hi: "नामांकन",       status: "inactive" },
                  { en: "Results",     hi: "परिणाम",        status: "inactive" },
                ].map((item) => (
                  <div key={item.en} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                    <span className="font-medium"><T en={item.en} hi={item.hi} /></span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                      <T en="Inactive" hi="निष्क्रिय" />
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div className="rounded-xl border bg-card p-4 shadow-sm">
              <h3 className="mb-3 text-sm font-bold">
                <T en="Quick Links" hi="त्वरित लिंक" />
              </h3>
              <ul className="space-y-1.5">
                {[
                  { href: "/news?category=NOTICES", en: "Election Notices", hi: "चुनाव सूचनाएँ" },
                  { href: "/news",                 en: "Election News",    hi: "चुनाव समाचार" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="flex items-center gap-1.5 text-[12px] text-primary hover:underline"
                    >
                      <ChevronRight size={11} />
                      <T en={link.en} hi={link.hi} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="rounded-xl border bg-amber-50 p-4">
              <p className="text-xs font-semibold text-amber-800">
                <T en="Election Committee Contact" hi="चुनाव समिति संपर्क" />
              </p>
              <p className="mt-1 text-[11px] text-amber-700">
                <T
                  en="For queries about the Vyapari Mahasangh elections, contact us at news@newmarket.co.in"
                  hi="व्यापारी महासंघ चुनाव से संबंधित प्रश्नों के लिए संपर्क करें: news@newmarket.co.in"
                />
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
