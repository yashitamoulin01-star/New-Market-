"use client"

import { useActionState, useState } from "react"
import { useFormStatus } from "react-dom"
import Link from "next/link"
import { submitNewsAction } from "./actions"
import { useLanguage } from "@/contexts/language-context"
import { ImageUploadInput } from "@/components/ui/image-upload-input"

const NEWS_CATEGORIES = [
  { value: "GENERAL",   en: "General",   hi: "सामान्य" },
  { value: "EVENTS",    en: "Events",    hi: "इवेंट" },
  { value: "NOTICES",   en: "Notices",   hi: "सूचनाएँ" },
  { value: "BUSINESS",  en: "Business",  hi: "व्यापार" },
  { value: "COMMUNITY", en: "Community", hi: "समुदाय" },
  { value: "SAFETY",    en: "Safety",    hi: "सुरक्षा" },
  { value: "TRAFFIC",   en: "Traffic",   hi: "यातायात" },
]

function SubmitButton() {
  const { pending } = useFormStatus()
  const { lang } = useLanguage()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-primary py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60 sm:w-auto sm:px-8"
    >
      {pending
        ? (lang === "hi" ? "भेजा जा रहा है…" : "Submitting…")
        : (lang === "hi" ? "समीक्षा के लिए भेजें" : "Submit for Review")}
    </button>
  )
}

const inputClass =
  "w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"

const labelClass = "mb-1 block text-sm font-medium"

function categoryLabel(cat: string) {
  const found = NEWS_CATEGORIES.find((c) => c.value === cat)
  return found ? found.en : cat.charAt(0) + cat.slice(1).toLowerCase()
}

export default function SubmitNewsPage() {
  const [state, action] = useActionState(submitNewsAction, { success: false })
  const { lang } = useLanguage()
  const [anon, setAnon] = useState(false)

  const t = {
    backToNews:       lang === "hi" ? "← समाचार पर वापस" : "← Back to News",
    heading:          lang === "hi" ? "समाचार भेजें" : "Submit News",
    subheading:       lang === "hi"
      ? "कोई स्थानीय अपडेट, इवेंट या घोषणा शेयर करें। प्रकाशन से पहले समीक्षा होगी।"
      : "Share a local update, event, or announcement. Your submission will be reviewed before publishing.",
    titleLabel:       lang === "hi" ? "शीर्षक" : "Title",
    titlePlaceholder: lang === "hi" ? "क्या हुआ?" : "What happened?",
    categoryLabel:    lang === "hi" ? "श्रेणी" : "Category",
    categoryDefault:  lang === "hi" ? "श्रेणी चुनें…" : "Select a category…",
    excerptLabel:     lang === "hi" ? "संक्षिप्त सारांश" : "Short Summary",
    excerptOptional:  lang === "hi" ? "(वैकल्पिक)" : "(optional)",
    excerptPlaceholder: lang === "hi" ? "एक वाक्य में समाचार बताएं…" : "One sentence describing the news…",
    contentLabel:     lang === "hi" ? "पूरी खबर" : "Full Story",
    contentPlaceholder: lang === "hi" ? "पूरा समाचार यहाँ लिखें…" : "Write the full news article here…",
    coverLabel:       lang === "hi" ? "कवर इमेज URL" : "Cover Image URL",
    coverHint:        lang === "hi" ? "सीधा इमेज लिंक पेस्ट करें (Imgur, Google Drive आदि)" : "Paste a direct image link (Imgur, Google Drive, etc.)",
    contactSection:   lang === "hi" ? "आपकी संपर्क जानकारी" : "Your Contact Info",
    yourName:         lang === "hi" ? "आपका नाम" : "Your Name",
    email:            lang === "hi" ? "ईमेल" : "Email",
    emailHint:        lang === "hi" ? "सार्वजनिक नहीं होगा। सत्यापन के लिए उपयोग होगा।" : "Not shown publicly. Used only if we need to verify.",
    phone:            lang === "hi" ? "फ़ोन" : "Phone",
    anonLabel:        lang === "hi" ? "गुमनाम रूप से पोस्ट करें" : "Post anonymously",
    anonHint:         lang === "hi"
      ? "आपका नाम सार्वजनिक नहीं दिखेगा। ईमेल केवल समीक्षा के लिए रखा जाएगा।"
      : "Your name won't be shown publicly. Your email is kept private for moderation only.",
    required:         "*",
    // success screen
    successTitle:     lang === "hi" ? "✓ समीक्षा के लिए भेजा गया" : "✓ Submitted for Review",
    successBody:      lang === "hi"
      ? "आपका लेख स्वीकृति प्रतीक्षा में है और अनुमोदन के बाद साइट पर दिखेगा।"
      : "Your article is pending admin approval and will appear on the site once approved.",
    pending:          lang === "hi" ? "प्रतीक्षारत" : "PENDING",
    submittedBy:      lang === "hi" ? "द्वारा भेजा गया" : "Submitted by",
    backBtn:          lang === "hi" ? "समाचार पर वापस" : "Back to News",
    anotherBtn:       lang === "hi" ? "और भेजें" : "Submit Another",
  }

  if (state.success && state.article) {
    const { title, category, excerpt, content, submitter_name, is_anonymous } = state.article
    return (
      <div className="container max-w-2xl py-10">
        <div className="mb-6 rounded-lg bg-green-50 border border-green-200 px-5 py-4 text-center">
          <p className="text-lg font-semibold text-green-800">{t.successTitle}</p>
          <p className="mt-1 text-sm text-green-700">{t.successBody}</p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded-full bg-yellow-100 px-3 py-0.5 text-xs font-medium text-yellow-800">
              {t.pending}
            </span>
            <span className="text-sm text-muted-foreground">
              {categoryLabel(category)}
            </span>
          </div>

          <h2 className="mb-2 text-xl font-bold">{title}</h2>

          {excerpt && (
            <p className="mb-3 text-sm italic text-muted-foreground">{excerpt}</p>
          )}

          <div className="space-y-3 text-sm leading-relaxed text-foreground/85">
            {content.split(/\n\n+/).map((para, i) => (
              <p key={i}>{para.trim()}</p>
            ))}
          </div>

          <div className="mt-5 border-t pt-4 flex items-center gap-2 text-xs text-muted-foreground">
            {is_anonymous ? (
              <span className="flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">
                🛡️ {lang === "hi" ? "गुमनाम पोस्ट" : "Posted anonymously"}
              </span>
            ) : (
              <span>{t.submittedBy} <strong>{submitter_name}</strong></span>
            )}
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Link
            href="/news"
            className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {t.backBtn}
          </Link>
          <Link
            href="/news/submit"
            className="rounded-md border px-5 py-2 text-sm font-medium hover:bg-secondary"
          >
            {t.anotherBtn}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-2xl py-8">
      <Link
        href="/news"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        {t.backToNews}
      </Link>

      <h1 className="mb-1 text-2xl font-bold">{t.heading}</h1>
      <p className="mb-6 text-sm text-muted-foreground">{t.subheading}</p>

      <form action={action} className="space-y-5">
        {state.error && (
          <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {state.error}
          </div>
        )}

        <div>
          <label htmlFor="title" className={labelClass}>
            {t.titleLabel} <span className="text-destructive">{t.required}</span>
          </label>
          <input
            id="title" name="title" type="text"
            required maxLength={200} placeholder={t.titlePlaceholder}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="category" className={labelClass}>
            {t.categoryLabel} <span className="text-destructive">{t.required}</span>
          </label>
          <select id="category" name="category" required className={inputClass}>
            <option value="">{t.categoryDefault}</option>
            {NEWS_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{lang === "hi" ? c.hi : c.en}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="excerpt" className={labelClass}>
            {t.excerptLabel} <span className="text-muted-foreground">{t.excerptOptional}</span>
          </label>
          <input
            id="excerpt" name="excerpt" type="text"
            maxLength={500} placeholder={t.excerptPlaceholder}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="content" className={labelClass}>
            {t.contentLabel} <span className="text-destructive">{t.required}</span>
          </label>
          <textarea
            id="content" name="content"
            required rows={8} placeholder={t.contentPlaceholder}
            className={inputClass}
          />
        </div>

        <ImageUploadInput
          name="cover_image_url"
          label={t.coverLabel}
          optional
          hint={t.coverHint}
          lang={lang}
        />

        <hr className="border-border" />
        <p className="text-sm font-medium">{t.contactSection}</p>

        <input type="hidden" name="is_anonymous" value={String(anon)} />

        <div>
          <label className="flex cursor-pointer select-none items-center gap-2">
            <input
              type="checkbox"
              checked={anon}
              onChange={(e) => setAnon(e.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            <span className="text-sm font-medium">{t.anonLabel}</span>
          </label>
          {anon && (
            <p className="mt-1.5 text-xs text-muted-foreground">{t.anonHint}</p>
          )}
        </div>

        {!anon && (
          <div>
            <label htmlFor="submitter_name" className={labelClass}>
              {t.yourName} <span className="text-destructive">{t.required}</span>
            </label>
            <input
              id="submitter_name" name="submitter_name"
              type="text" required maxLength={100} className={inputClass}
            />
          </div>
        )}

        <div>
          <label htmlFor="submitter_email" className={labelClass}>
            {t.email} <span className="text-destructive">{t.required}</span>
          </label>
          <input
            id="submitter_email" name="submitter_email"
            type="email" required className={inputClass}
          />
          <p className="mt-1 text-xs text-muted-foreground">{t.emailHint}</p>
        </div>

        <div>
          <label htmlFor="submitter_phone" className={labelClass}>
            {t.phone} <span className="text-muted-foreground">{t.excerptOptional}</span>
          </label>
          <input
            id="submitter_phone" name="submitter_phone"
            type="tel" maxLength={15} placeholder="+91 …" className={inputClass}
          />
        </div>

        <SubmitButton />
      </form>
    </div>
  )
}
