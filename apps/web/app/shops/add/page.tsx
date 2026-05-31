"use client"

import { useActionState, useState } from "react"
import { useFormStatus } from "react-dom"
import Link from "next/link"
import { Store, CheckCircle, ChevronLeft } from "lucide-react"
import { addShopAction, type AddShopState } from "./actions"
import { useLanguage } from "@/contexts/language-context"
import { ImageUploadInput } from "@/components/ui/image-upload-input"
import { MultiImageGalleryInput } from "@/components/ui/multi-image-gallery-input"
import { SubmissionConsent } from "@/components/ui/submission-consent"
import { PhoneInput } from "@/components/ui/phone-input"

const initialState: AddShopState = { success: false }

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus()
  const { lang } = useLanguage()
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
    >
      {pending
        ? (lang === "hi" ? "भेजा जा रहा है…" : "Submitting…")
        : (lang === "hi" ? "दुकान लिस्टिंग भेजें" : "Submit Shop Listing")}
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

export default function AddShopPage() {
  const [state, action] = useActionState(addShopAction, initialState)
  const { lang } = useLanguage()
  const [agreed, setAgreed] = useState(false)
  const [phoneValid, setPhoneValid] = useState(false)
  const hi = lang === "hi"

  if (state.success && state.shop) {
    return (
      <div className="container max-w-lg py-16 text-center">
        <CheckCircle size={48} className="mx-auto mb-4 text-emerald-500" />
        <h1 className="mb-2 font-heading text-2xl font-bold">
          {hi ? "दुकान भेजी गई!" : "Shop Submitted!"}
        </h1>
        <p className="mb-1 text-muted-foreground">
          <span className="font-medium text-foreground">{state.shop.name}</span>{" "}
          {hi ? "समीक्षा के लिए भेजी गई।" : "has been submitted for review."}
        </p>
        <p className="mb-8 text-sm text-muted-foreground">
          {hi
            ? "हमारी टीम के अनुमोदन के बाद यह डायरेक्टरी में दिखेगी (आमतौर पर 24 घंटे में)।"
            : "It will appear in the directory once our team approves it (usually within 24 hours)."}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/shops"
            className="rounded-full border px-5 py-2 text-sm font-medium transition hover:bg-muted"
          >
            {hi ? "दुकानें देखें" : "Browse Shops"}
          </Link>
          <Link
            href="/shops/add"
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            {hi ? "और जोड़ें" : "Add Another"}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-2xl py-8">
      <Link
        href="/shops"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition"
      >
        <ChevronLeft size={15} />
        {hi ? "सभी दुकानें" : "All Shops"}
      </Link>

      <div className="mb-6 flex items-center gap-2">
        <Store size={22} className="text-primary" />
        <h1 className="font-heading text-2xl font-bold">
          {hi ? "अपनी दुकान जोड़ें" : "Add Your Shop"}
        </h1>
      </div>
      <p className="mb-8 text-sm text-muted-foreground">
        {hi
          ? "न्यू मार्केट की डायरेक्टरी में अपनी दुकान दर्ज करें। 24 घंटे में समीक्षा कर प्रकाशित किया जाएगा।"
          : "List your New Market shop in the directory. It will be reviewed and published within 24 hours."}
      </p>

      <form action={action} className="space-y-6">
        {/* ── Shop Info ── */}
        <section className="rounded-xl border bg-card p-5">
          <h2 className="mb-4 font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {hi ? "दुकान की जानकारी" : "Shop Details"}
          </h2>
          <div className="space-y-4">
            <div>
              <FieldLabel htmlFor="name" required>
                {hi ? "दुकान का नाम" : "Shop Name"}
              </FieldLabel>
              <input
                id="name" name="name" type="text" required
                placeholder={hi ? "जैसे — कृष्णा इलेक्ट्रॉनिक्स" : "e.g. Krishna Electronics"}
                className={inputCls}
              />
            </div>

            <div>
              <FieldLabel htmlFor="description" required>
                {hi ? "विवरण" : "Description"}
              </FieldLabel>
              <textarea
                id="description" name="description" required
                placeholder={hi
                  ? "आपकी दुकान क्या बेचती है? क्या खास है?"
                  : "What does your shop sell? What makes it special?"}
                className={textareaCls}
              />
            </div>

            <div>
              <FieldLabel htmlFor="tags">
                {hi ? "टैग (अल्पविराम से अलग करें)" : "Tags (comma separated)"}
              </FieldLabel>
              <input
                id="tags" name="tags" type="text"
                placeholder={hi
                  ? "जैसे — साड़ियाँ, लहंगा, शादी के कपड़े, डिज़ाइनर"
                  : "e.g. sarees, lehenga, wedding wear, designer"}
                className={inputCls}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {hi
                  ? "प्रासंगिक कीवर्ड से ग्राहक आसानी से खोज सकें।"
                  : "Help customers find you through relevant keywords."}
              </p>
            </div>
          </div>
        </section>

        {/* ── Location ── */}
        <section className="rounded-xl border bg-card p-5">
          <h2 className="mb-4 font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {hi ? "स्थान और समय" : "Location & Hours"}
          </h2>
          <div className="space-y-4">
            <div>
              <FieldLabel htmlFor="address" required>
                {hi ? "दुकान का पता" : "Shop Address"}
              </FieldLabel>
              <input
                id="address" name="address" type="text" required
                placeholder={hi
                  ? "जैसे — दुकान 12, ब्लॉक A, न्यू मार्केट, भोपाल"
                  : "e.g. Shop 12, Block A, New Market, Bhopal"}
                className={inputCls}
              />
            </div>
            <div>
              <FieldLabel htmlFor="opening_hours">
                {hi ? "खुलने का समय" : "Opening Hours"}
              </FieldLabel>
              <input
                id="opening_hours" name="opening_hours" type="text"
                placeholder={hi ? "जैसे — सुबह 10 – रात 9, सोम–शनि" : "e.g. 10am – 9pm, Mon–Sat"}
                className={inputCls}
              />
            </div>
          </div>
        </section>

        {/* ── Contact ── */}
        <section className="rounded-xl border bg-card p-5">
          <h2 className="mb-4 font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {hi ? "संपर्क जानकारी" : "Contact Information"}
          </h2>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel htmlFor="phone" required>
                  {hi ? "फ़ोन नंबर" : "Phone Number"}
                </FieldLabel>
                <PhoneInput
                  name="phone"
                  lang={lang}
                  required
                  className={inputCls}
                  onValidChange={setPhoneValid}
                />
              </div>
              <div>
                <FieldLabel htmlFor="email">
                  {hi ? "ईमेल पता" : "Email Address"}
                </FieldLabel>
                <input
                  id="email" name="email" type="email"
                  placeholder="shop@example.com" className={inputCls}
                />
              </div>
            </div>
            <div>
              <FieldLabel htmlFor="website">
                {hi ? "वेबसाइट / सोशल लिंक" : "Website / Social Link"}
              </FieldLabel>
              <input id="website" name="website" type="url" placeholder="https://…" className={inputCls} />
            </div>
          </div>
        </section>

        {/* ── Media ── */}
        <section className="rounded-xl border bg-card p-5">
          <h2 className="mb-4 font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {hi ? "तस्वीरें (वैकल्पिक)" : "Photos (optional)"}
          </h2>
          <div className="space-y-4">
            <ImageUploadInput name="logo_url" label={hi ? "लोगो" : "Logo"} optional lang={lang} />
            <MultiImageGalleryInput
              name="gallery_image"
              label={hi ? "दुकान की तस्वीरें" : "Shop Photos"}
              lang={lang}
              maxImages={6}
              hint={hi ? "पहली तस्वीर कवर के रूप में दिखेगी।" : "First image will be shown as the cover photo."}
            />
          </div>
        </section>

        {state.error && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {state.error}
          </p>
        )}

        <SubmissionConsent lang={lang} onChecked={setAgreed} />

        <SubmitButton disabled={!agreed || !phoneValid} />
      </form>
    </div>
  )
}
