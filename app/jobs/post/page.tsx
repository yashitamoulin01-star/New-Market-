"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import Link from "next/link"
import { Briefcase, CheckCircle, ChevronLeft } from "lucide-react"
import { postJobAction, type PostJobState } from "./actions"
import {
  JOB_TYPE_LABELS_BI,
  JOB_CATEGORY_LABELS_BI,
  APP_MODE_LABELS_BI,
} from "@/lib/supabase/jobs-defs"
import { useLanguage } from "@/contexts/language-context"

const initialState: PostJobState = { success: false }

function SubmitButton() {
  const { pending } = useFormStatus()
  const { lang } = useLanguage()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
    >
      {pending
        ? (lang === "hi" ? "भेजा जा रहा है…" : "Submitting…")
        : (lang === "hi" ? "नौकरी लिस्टिंग भेजें" : "Submit Job Listing")}
    </button>
  )
}

function FieldLabel({ htmlFor, children, required }: { htmlFor: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-foreground">
      {children} {required && <span className="text-destructive">*</span>}
    </label>
  )
}

const inputCls = "w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition"
const textareaCls = `${inputCls} resize-y min-h-[100px]`
const selectCls = `${inputCls} cursor-pointer`

export default function PostJobPage() {
  const [state, action] = useActionState(postJobAction, initialState)
  const { lang } = useLanguage()

  const hi = lang === "hi"

  if (state.success && state.job) {
    return (
      <div className="container max-w-lg py-16 text-center">
        <CheckCircle size={48} className="mx-auto mb-4 text-emerald-500" />
        <h1 className="mb-2 font-heading text-2xl font-bold">
          {hi ? "नौकरी भेजी गई!" : "Job Submitted!"}
        </h1>
        <p className="mb-1 text-muted-foreground">
          <span className="font-medium text-foreground">{state.job.title}</span>{" "}
          {hi ? "समीक्षा के लिए भेजा गया।" : "has been submitted for review."}
        </p>
        <p className="mb-8 text-sm text-muted-foreground">
          {hi
            ? "हमारी टीम के अनुमोदन के बाद यह Jobs पेज पर दिखेगा।"
            : "It will appear on the Jobs page once our team approves it."}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/jobs"
            className="rounded-full border px-5 py-2 text-sm font-medium hover:bg-muted transition"
          >
            {hi ? "नौकरियाँ देखें" : "Browse Jobs"}
          </Link>
          <Link
            href="/jobs/post"
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            {hi ? "और पोस्ट करें" : "Post Another"}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-2xl py-8">
      <Link
        href="/jobs"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition"
      >
        <ChevronLeft size={15} />
        {hi ? "सभी नौकरियाँ" : "All Jobs"}
      </Link>

      <div className="mb-6 flex items-center gap-2">
        <Briefcase size={22} className="text-primary" />
        <h1 className="font-heading text-2xl font-bold">
          {hi ? "नौकरी पोस्ट करें" : "Post a Job"}
        </h1>
      </div>
      <p className="mb-8 text-sm text-muted-foreground">
        {hi
          ? "नौकरी की जानकारी भरें। 24 घंटे में समीक्षा कर प्रकाशित किया जाएगा।"
          : "Fill in your job listing details. It will be reviewed and published within 24 hours."}
      </p>

      <form action={action} className="space-y-6">
        {/* ── Job Details ── */}
        <section className="rounded-xl border bg-card p-5">
          <h2 className="mb-4 font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {hi ? "नौकरी विवरण" : "Job Details"}
          </h2>

          <div className="space-y-4">
            <div>
              <FieldLabel htmlFor="title" required>
                {hi ? "नौकरी का शीर्षक" : "Job Title"}
              </FieldLabel>
              <input
                id="title" name="title" type="text" required
                placeholder={hi ? "जैसे — सेल्स एसोसिएट, शेफ, दर्जी" : "e.g. Sales Associate, Chef, Tailor"}
                className={inputCls}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel htmlFor="category" required>
                  {hi ? "श्रेणी" : "Category"}
                </FieldLabel>
                <select id="category" name="category" required className={selectCls}>
                  <option value="">{hi ? "श्रेणी चुनें" : "Select category"}</option>
                  {Object.entries(JOB_CATEGORY_LABELS_BI).map(([k, v]) => (
                    <option key={k} value={k}>{hi ? v.hi : v.en}</option>
                  ))}
                </select>
              </div>
              <div>
                <FieldLabel htmlFor="job_type" required>
                  {hi ? "नौकरी का प्रकार" : "Job Type"}
                </FieldLabel>
                <select id="job_type" name="job_type" required className={selectCls}>
                  <option value="">{hi ? "प्रकार चुनें" : "Select type"}</option>
                  {Object.entries(JOB_TYPE_LABELS_BI).map(([k, v]) => (
                    <option key={k} value={k}>{hi ? v.hi : v.en}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <FieldLabel htmlFor="description" required>
                {hi ? "नौकरी विवरण" : "Job Description"}
              </FieldLabel>
              <textarea
                id="description" name="description" required
                placeholder={hi
                  ? "भूमिका, जिम्मेदारियाँ और आवश्यकताएँ बताएं…"
                  : "Describe the role, responsibilities, and what you're looking for…"}
                className={textareaCls}
              />
            </div>

            <div>
              <FieldLabel htmlFor="requirements">
                {hi ? "आवश्यकताएँ" : "Requirements"}
              </FieldLabel>
              <textarea
                id="requirements" name="requirements"
                placeholder={hi
                  ? "कौशल, योग्यता, भाषा आदि"
                  : "Skills, qualifications, languages, etc."}
                className={textareaCls} style={{ minHeight: 80 }}
              />
            </div>

            <div>
              <FieldLabel htmlFor="benefits">
                {hi ? "लाभ / सुविधाएँ" : "Benefits / Perks"}
              </FieldLabel>
              <textarea
                id="benefits" name="benefits"
                placeholder={hi
                  ? "PF, खाना, आवास, कमीशन आदि"
                  : "PF, meals, accommodation, commission, etc."}
                className={textareaCls} style={{ minHeight: 80 }}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel htmlFor="openings">
                  {hi ? "पदों की संख्या" : "Number of Openings"}
                </FieldLabel>
                <input id="openings" name="openings" type="number" min={1} defaultValue={1} className={inputCls} />
              </div>
              <div>
                <FieldLabel htmlFor="experience_years">
                  {hi ? "अनुभव (वर्ष)" : "Experience Required (years)"}
                </FieldLabel>
                <input
                  id="experience_years" name="experience_years" type="number" min={0}
                  placeholder={hi ? "0 — फ्रेशर के लिए" : "0 for freshers"}
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <FieldLabel htmlFor="timing">
                {hi ? "काम का समय" : "Work Timing"}
              </FieldLabel>
              <input
                id="timing" name="timing" type="text"
                placeholder={hi ? "जैसे — सुबह 10 – शाम 8, सोम–शनि" : "e.g. 10am – 8pm, Mon–Sat"}
                className={inputCls}
              />
            </div>
          </div>
        </section>

        {/* ── Compensation ── */}
        <section className="rounded-xl border bg-card p-5">
          <h2 className="mb-4 font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {hi ? "वेतन" : "Compensation"}
          </h2>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel htmlFor="salary_min">
                  {hi ? "न्यूनतम वेतन (₹/माह)" : "Min Salary (₹/month)"}
                </FieldLabel>
                <input
                  id="salary_min" name="salary_min" type="number" min={0}
                  placeholder={hi ? "जैसे — 8000" : "e.g. 8000"}
                  className={inputCls}
                />
              </div>
              <div>
                <FieldLabel htmlFor="salary_max">
                  {hi ? "अधिकतम वेतन (₹/माह)" : "Max Salary (₹/month)"}
                </FieldLabel>
                <input
                  id="salary_max" name="salary_max" type="number" min={0}
                  placeholder={hi ? "जैसे — 15000" : "e.g. 15000"}
                  className={inputCls}
                />
              </div>
            </div>
            <div>
              <FieldLabel htmlFor="salary_label">
                {hi ? "या कस्टम लेबल लिखें" : "Or use custom label"}
              </FieldLabel>
              <input
                id="salary_label" name="salary_label" type="text"
                placeholder={hi ? 'जैसे — "बातचीत योग्य" या "कमीशन आधारित"' : 'e.g. "Negotiable" or "Commission based"'}
                className={inputCls}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {hi
                  ? "यदि भरा हो तो ऊपर की वेतन सीमा की जगह यही दिखेगा।"
                  : "If provided, this overrides the salary range above."}
              </p>
            </div>
          </div>
        </section>

        {/* ── Employer & Location ── */}
        <section className="rounded-xl border bg-card p-5">
          <h2 className="mb-4 font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {hi ? "दुकान / व्यापार" : "Shop / Business"}
          </h2>
          <div className="space-y-4">
            <div>
              <FieldLabel htmlFor="shop_name" required>
                {hi ? "दुकान / व्यापार का नाम" : "Shop / Business Name"}
              </FieldLabel>
              <input
                id="shop_name" name="shop_name" type="text" required
                placeholder={hi ? "जैसे — कृष्णा इलेक्ट्रॉनिक्स" : "e.g. Krishna Electronics"}
                className={inputCls}
              />
            </div>
            <div>
              <FieldLabel htmlFor="shop_address">
                {hi ? "पता / स्थान" : "Address / Location"}
              </FieldLabel>
              <input
                id="shop_address" name="shop_address" type="text"
                placeholder={hi ? "जैसे — दुकान 45, नई मार्केट, भोपाल" : "e.g. Shop 45, New Market, Bhopal"}
                className={inputCls}
              />
            </div>
          </div>
        </section>

        {/* ── Application ── */}
        <section className="rounded-xl border bg-card p-5">
          <h2 className="mb-4 font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {hi ? "आवेदन कैसे करें" : "How to Apply"}
          </h2>
          <div className="space-y-4">
            <div>
              <FieldLabel htmlFor="application_mode" required>
                {hi ? "आवेदन का तरीका" : "Application Method"}
              </FieldLabel>
              <select id="application_mode" name="application_mode" required className={selectCls}>
                <option value="">{hi ? "तरीका चुनें" : "Select method"}</option>
                {Object.entries(APP_MODE_LABELS_BI).map(([k, v]) => (
                  <option key={k} value={k}>{hi ? v.hi : v.en}</option>
                ))}
              </select>
            </div>
            <div>
              <FieldLabel htmlFor="application_link">
                {hi ? "आवेदन लिंक (ऑनलाइन आवेदन के लिए)" : "Application Link (for online applications)"}
              </FieldLabel>
              <input
                id="application_link" name="application_link" type="url"
                placeholder="https://…" className={inputCls}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel htmlFor="contact_name" required>
                  {hi ? "संपर्क व्यक्ति" : "Contact Person"}
                </FieldLabel>
                <input
                  id="contact_name" name="contact_name" type="text" required
                  placeholder={hi ? "भर्ती करने वाले का नाम" : "Name of hiring person"}
                  className={inputCls}
                />
              </div>
              <div>
                <FieldLabel htmlFor="contact_phone">
                  {hi ? "संपर्क फ़ोन" : "Contact Phone"}
                </FieldLabel>
                <input
                  id="contact_phone" name="contact_phone" type="tel"
                  placeholder={hi ? "10 अंकों का मोबाइल नंबर" : "10-digit mobile number"}
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <FieldLabel htmlFor="contact_email" required>
                {hi ? "संपर्क ईमेल" : "Contact Email"}
              </FieldLabel>
              <input
                id="contact_email" name="contact_email" type="email" required
                placeholder="you@example.com" className={inputCls}
              />
            </div>
          </div>
        </section>

        {state.error && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {state.error}
          </p>
        )}

        <SubmitButton />

        <p className="text-center text-xs text-muted-foreground">
          {hi
            ? "सबमिट करके आप पुष्टि करते हैं कि जानकारी सही है। लिस्टिंग प्रकाशन से पहले समीक्षा की जाएगी।"
            : "By submitting you agree that the information is accurate. Listings are reviewed before publishing."}
        </p>
      </form>
    </div>
  )
}
