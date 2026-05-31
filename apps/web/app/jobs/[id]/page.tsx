import Link from "next/link"
import { notFound } from "next/navigation"
import {
  Briefcase, MapPin, Phone, Mail, Globe, Users,
  Clock, Calendar, ChevronLeft, Eye,
} from "lucide-react"
import {
  getJobById,
  JOB_TYPE_LABELS_BI,
  APP_MODE_LABELS_BI,
  formatSalary,
} from "@/lib/supabase/jobs"
import { T } from "@/components/ui/t"

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const job = await getJobById(id)
  if (!job) return { title: "Job Not Found" }
  return {
    title: `${job.title} at ${job.shop_name} — New Market`,
    description: job.description.slice(0, 160),
  }
}

function Section({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="mb-2 font-heading text-base font-semibold text-foreground">{title}</h2>
      {children}
    </div>
  )
}

function Prose({ text }: { text: string }) {
  return (
    <div className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap" style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>
      {text}
    </div>
  )
}

export default async function JobDetailPage({ params }: PageProps) {
  const { id } = await params
  const job = await getJobById(id)

  if (!job) notFound()

  const salary = formatSalary(job.salary_min, job.salary_max, job.salary_label)
  const postedDate = new Date(job.created_at).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  })

  const typeLabel = JOB_TYPE_LABELS_BI[job.job_type]
  const appLabel  = APP_MODE_LABELS_BI[job.application_mode]

  return (
    <div className="container py-8">
      <Link
        href="/jobs"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition"
      >
        <ChevronLeft size={15} />
        <T en="All Jobs" hi="सभी नौकरियाँ" />
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border bg-card p-6">
            {/* Title block */}
            <div className="mb-5 flex flex-wrap items-start gap-2">
              <div className="flex-1">
                <div className="mb-2 flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    {typeLabel ? <T en={typeLabel.en} hi={typeLabel.hi} /> : job.job_type}
                  </span>
                  {job.is_featured && (
                    <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
                      <T en="Featured" hi="फ़ीचर्ड" />
                    </span>
                  )}
                </div>
                <h1 className="font-heading text-xl font-bold leading-snug text-foreground sm:text-2xl">
                  {job.title}
                </h1>
                <p className="mt-1 text-base font-medium text-muted-foreground">
                  {job.shop_name}
                </p>
              </div>
            </div>

            {/* Quick stats */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { icon: Briefcase, labelEn: "Salary",     labelHi: "वेतन",        value: salary },
                { icon: Users,    labelEn: "Openings",    labelHi: "पद",           value: String(job.openings) },
                ...(job.experience_years != null
                  ? [{ icon: Clock, labelEn: "Experience", labelHi: "अनुभव", value: `${job.experience_years}+ yr${job.experience_years !== 1 ? "s" : ""}` }]
                  : []),
                ...(job.timing
                  ? [{ icon: Clock, labelEn: "Timing",   labelHi: "समय",         value: job.timing }]
                  : []),
              ].map(({ icon: Icon, labelEn, labelHi, value }) => (
                <div key={labelEn} className="rounded-lg bg-muted/60 p-3">
                  <Icon size={13} className="mb-1 text-primary" />
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    <T en={labelEn} hi={labelHi} />
                  </p>
                  <p className="text-sm font-semibold text-foreground">{value}</p>
                </div>
              ))}
            </div>

            <Section title={<T en="About the Role" hi="भूमिका के बारे में" />}>
              <Prose text={job.description} />
            </Section>

            {job.requirements && (
              <Section title={<T en="Requirements" hi="आवश्यकताएँ" />}>
                <Prose text={job.requirements} />
              </Section>
            )}

            {job.benefits && (
              <Section title={<T en="Benefits" hi="लाभ / सुविधाएँ" />}>
                <Prose text={job.benefits} />
              </Section>
            )}

            <div className="mt-6 flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar size={11} />
                <T en={`Posted ${postedDate}`} hi={`पोस्ट किया ${postedDate}`} />
              </span>
              <span className="flex items-center gap-1">
                <Eye size={11} />
                {job.view_count.toLocaleString()} <T en="views" hi="व्यूज़" />
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-5">
            <h2 className="mb-4 font-heading text-base font-semibold">
              <T en="How to Apply" hi="आवेदन कैसे करें" />
            </h2>
            <p className="mb-4 text-sm font-medium text-primary">
              {appLabel ? <T en={appLabel.en} hi={appLabel.hi} /> : job.application_mode}
            </p>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2 text-muted-foreground">
                <Users size={14} className="mt-0.5 shrink-0 text-primary" />
                <span>{job.contact_name}</span>
              </div>

              <a
                href={`tel:${job.contact_phone}`}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition"
              >
                <Phone size={14} className="shrink-0 text-primary" />
                {job.contact_phone ?? <T en="Not provided" hi="उपलब्ध नहीं" />}
              </a>

              <a
                href={`mailto:${job.contact_email}`}
                className="flex items-center gap-2 break-all text-muted-foreground hover:text-primary transition"
              >
                <Mail size={14} className="shrink-0 text-primary" />
                {job.contact_email}
              </a>

              {job.application_link && (
                <a
                  href={job.application_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition"
                >
                  <Globe size={14} className="shrink-0 text-primary" />
                  <T en="Apply Online" hi="ऑनलाइन आवेदन करें" />
                </a>
              )}
            </div>

            {job.application_mode === "WALK_IN" && job.shop_address && (
              <div className="mt-4 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
                <p className="mb-1 flex items-center gap-1 font-medium text-foreground">
                  <MapPin size={11} />
                  <T en="Walk in at:" hi="यहाँ आएँ:" />
                </p>
                {job.shop_address}
              </div>
            )}

            {job.application_mode === "PHONE" && job.contact_phone && (
              <a
                href={`tel:${job.contact_phone}`}
                className="mt-4 block w-full rounded-lg bg-primary py-2.5 text-center text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                <T en="Call Now" hi="अभी कॉल करें" />
              </a>
            )}

            {job.application_mode === "EMAIL" && (
              <a
                href={`mailto:${job.contact_email}?subject=Application for ${job.title}`}
                className="mt-4 block w-full rounded-lg bg-primary py-2.5 text-center text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                <T en="Send Email" hi="ईमेल भेजें" />
              </a>
            )}

            {job.application_mode === "ONLINE" && job.application_link && (
              <a
                href={job.application_link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 block w-full rounded-lg bg-primary py-2.5 text-center text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                <T en="Apply Online" hi="ऑनलाइन आवेदन करें" />
              </a>
            )}
          </div>

          <div className="rounded-xl border bg-card p-5">
            <h2 className="mb-3 font-heading text-sm font-semibold">
              <T en="Employer" hi="नियोक्ता" />
            </h2>
            <p className="font-medium text-foreground">{job.shop_name}</p>
            {job.shop_address && (
              <p className="mt-1 flex items-start gap-1 text-xs text-muted-foreground">
                <MapPin size={11} className="mt-0.5 shrink-0" />
                {job.shop_address}
              </p>
            )}
          </div>

          <div className="rounded-xl border bg-primary/5 p-5 text-center">
            <p className="mb-2 text-sm font-medium">
              <T en="Hiring in New Market?" hi="न्यू मार्केट में भर्ती चाहिए?" />
            </p>
            <Link
              href="/jobs/post"
              className="inline-block rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              <T en="Post a Job Free" hi="मुफ़्त नौकरी पोस्ट करें" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
