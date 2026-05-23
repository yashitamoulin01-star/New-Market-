"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import Link from "next/link"
import { Building2, CheckCircle, ChevronLeft } from "lucide-react"
import { listPropertyAction, type ListPropertyState } from "./actions"
import { PROPERTY_TYPE_LABELS_BI, LISTING_TYPE_LABELS_BI } from "@/lib/supabase/property-defs"
import { useLanguage } from "@/contexts/language-context"

const initialState: ListPropertyState = { success: false }

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
        : (lang === "hi" ? "संपत्ति लिस्टिंग भेजें" : "Submit Property Listing")}
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

const inputCls    = "w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition"
const textareaCls = `${inputCls} resize-y min-h-[100px]`
const selectCls   = `${inputCls} cursor-pointer`

const AMENITY_PRESETS = [
  "Parking", "AC", "Lift", "24/7 Security", "CCTV",
  "Power Backup", "Storage Room", "Washroom", "High Ceiling",
  "Corner Shop", "Main Road Facing", "Basement",
]

export default function ListPropertyPage() {
  const [state, action] = useActionState(listPropertyAction, initialState)
  const { lang } = useLanguage()
  const hi = lang === "hi"

  if (state.success && state.property) {
    return (
      <div className="container max-w-lg py-16 text-center">
        <CheckCircle size={48} className="mx-auto mb-4 text-emerald-500" />
        <h1 className="mb-2 font-heading text-2xl font-bold">
          {hi ? "संपत्ति भेजी गई!" : "Property Submitted!"}
        </h1>
        <p className="mb-1 text-muted-foreground">
          <span className="font-medium text-foreground">{state.property.title}</span>{" "}
          {hi ? "समीक्षा के लिए भेजी गई।" : "has been submitted for review."}
        </p>
        <p className="mb-8 text-sm text-muted-foreground">
          {hi
            ? "हमारी टीम के अनुमोदन के बाद यह लिस्टिंग में दिखेगी (आमतौर पर 24 घंटे में)।"
            : "It will appear in the listings once our team approves it (usually within 24 hours)."}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/property"
            className="rounded-full border px-5 py-2 text-sm font-medium transition hover:bg-muted"
          >
            {hi ? "संपत्तियाँ देखें" : "Browse Properties"}
          </Link>
          <Link
            href="/property/list"
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            {hi ? "और लिस्ट करें" : "List Another"}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-2xl py-8">
      <Link
        href="/property"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition"
      >
        <ChevronLeft size={15} />
        {hi ? "सभी संपत्तियाँ" : "All Properties"}
      </Link>

      <div className="mb-6 flex items-center gap-2">
        <Building2 size={22} className="text-primary" />
        <h1 className="font-heading text-2xl font-bold">
          {hi ? "संपत्ति लिस्ट करें" : "List a Property"}
        </h1>
      </div>
      <p className="mb-8 text-sm text-muted-foreground">
        {hi
          ? "अपनी व्यावसायिक संपत्ति — दुकान, ऑफिस, गोदाम या शोरूम — लिस्ट करें। 24 घंटे में समीक्षा होगी।"
          : "List your commercial space — shop, office, warehouse, or showroom. Reviewed and published within 24 hours."}
      </p>

      <form action={action} className="space-y-6">
        {/* ── Property Details ── */}
        <section className="rounded-xl border bg-card p-5">
          <h2 className="mb-4 font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {hi ? "संपत्ति विवरण" : "Property Details"}
          </h2>
          <div className="space-y-4">
            <div>
              <FieldLabel htmlFor="title" required>
                {hi ? "लिस्टिंग शीर्षक" : "Listing Title"}
              </FieldLabel>
              <input
                id="title" name="title" type="text" required
                placeholder={hi
                  ? 'जैसे — "ब्लॉक A में प्राइम ग्राउंड फ्लोर दुकान"'
                  : 'e.g. "Prime Ground Floor Shop in Block A"'}
                className={inputCls}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel htmlFor="property_type" required>
                  {hi ? "संपत्ति का प्रकार" : "Property Type"}
                </FieldLabel>
                <select id="property_type" name="property_type" required className={selectCls}>
                  <option value="">{hi ? "प्रकार चुनें" : "Select type"}</option>
                  {Object.entries(PROPERTY_TYPE_LABELS_BI).map(([k, v]) => (
                    <option key={k} value={k}>{hi ? v.hi : v.en}</option>
                  ))}
                </select>
              </div>
              <div>
                <FieldLabel htmlFor="listing_type" required>
                  {hi ? "किस लिए" : "Listing For"}
                </FieldLabel>
                <select id="listing_type" name="listing_type" required className={selectCls}>
                  <option value="">{hi ? "चुनें…" : "Select…"}</option>
                  {Object.entries(LISTING_TYPE_LABELS_BI).map(([k, v]) => (
                    <option key={k} value={k}>{hi ? v.hi : v.en}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <FieldLabel htmlFor="description" required>
                {hi ? "विवरण" : "Description"}
              </FieldLabel>
              <textarea
                id="description" name="description" required
                placeholder={hi
                  ? "स्थान का विवरण — आकार, स्थिति, किसके लिए उपयुक्त…"
                  : "Describe the space — size, condition, what it's suitable for…"}
                className={textareaCls}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <FieldLabel htmlFor="area_sqft">
                  {hi ? "क्षेत्रफल (वर्ग फ़ीट)" : "Area (sq ft)"}
                </FieldLabel>
                <input
                  id="area_sqft" name="area_sqft" type="number" min={0}
                  placeholder={hi ? "जैसे — 250" : "e.g. 250"}
                  className={inputCls}
                />
              </div>
              <div>
                <FieldLabel htmlFor="floor">
                  {hi ? "मंज़िल" : "Floor"}
                </FieldLabel>
                <input
                  id="floor" name="floor" type="text"
                  placeholder={hi ? "जैसे — भूतल" : "e.g. Ground Floor"}
                  className={inputCls}
                />
              </div>
              <div>
                <FieldLabel htmlFor="is_furnished">
                  {hi ? "फर्निश्ड?" : "Furnished?"}
                </FieldLabel>
                <select id="is_furnished" name="is_furnished" className={selectCls}>
                  <option value="false">{hi ? "बिना फर्नीचर" : "Unfurnished"}</option>
                  <option value="true">{hi ? "फर्निश्ड" : "Furnished"}</option>
                </select>
              </div>
            </div>

            <div>
              <FieldLabel htmlFor="amenities">
                {hi ? "सुविधाएँ (अल्पविराम से अलग करें)" : "Amenities (comma separated)"}
              </FieldLabel>
              <input
                id="amenities" name="amenities" type="text"
                placeholder={hi
                  ? "पार्किंग, AC, लिफ्ट, CCTV, पावर बैकअप…"
                  : "Parking, AC, Lift, CCTV, Power Backup…"}
                className={inputCls}
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {AMENITY_PRESETS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    className="rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground hover:border-primary hover:text-primary transition"
                    onClick={() => {
                      const el = document.getElementById("amenities") as HTMLInputElement | null
                      if (!el) return
                      const current = el.value.trim()
                      const parts = current ? current.split(",").map((s) => s.trim()) : []
                      if (!parts.includes(a)) el.value = [...parts, a].join(", ")
                    }}
                  >
                    + {a}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Location ── */}
        <section className="rounded-xl border bg-card p-5">
          <h2 className="mb-4 font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {hi ? "स्थान" : "Location"}
          </h2>
          <div>
            <FieldLabel htmlFor="address" required>
              {hi ? "पूरा पता" : "Full Address"}
            </FieldLabel>
            <input
              id="address" name="address" type="text" required
              placeholder={hi
                ? "जैसे — दुकान 23, ब्लॉक C, न्यूमार्केट, भोपाल"
                : "e.g. Shop 23, Block C, New Market, Bhopal"}
              className={inputCls}
            />
          </div>
        </section>

        {/* ── Pricing ── */}
        <section className="rounded-xl border bg-card p-5">
          <h2 className="mb-4 font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {hi ? "मूल्य" : "Pricing"}
          </h2>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel htmlFor="price">
                  {hi ? "कीमत (₹)" : "Price (₹)"}
                </FieldLabel>
                <input
                  id="price" name="price" type="number" min={0}
                  placeholder={hi ? "मासिक किराया या बिक्री मूल्य" : "Monthly rent or sale price"}
                  className={inputCls}
                />
              </div>
              <div>
                <FieldLabel htmlFor="deposit">
                  {hi ? "सुरक्षा जमा (₹)" : "Security Deposit (₹)"}
                </FieldLabel>
                <input
                  id="deposit" name="deposit" type="number" min={0}
                  placeholder={hi ? "किराये की लिस्टिंग के लिए" : "For rental listings"}
                  className={inputCls}
                />
              </div>
            </div>
            <div>
              <FieldLabel htmlFor="price_label">
                {hi ? "या कस्टम मूल्य लेबल" : "Or use custom price label"}
              </FieldLabel>
              <input
                id="price_label" name="price_label" type="text"
                placeholder={hi
                  ? 'जैसे — "बातचीत योग्य" या "मूल्य पूछें"'
                  : 'e.g. "Negotiable" or "Price on request"'}
                className={inputCls}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {hi
                  ? "यदि भरा हो तो ऊपर की कीमत की जगह यही दिखेगा।"
                  : "If provided, this overrides the price above."}
              </p>
            </div>
          </div>
        </section>

        {/* ── Images ── */}
        <section className="rounded-xl border bg-card p-5">
          <h2 className="mb-4 font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {hi ? "छवियाँ (वैकल्पिक)" : "Images (optional)"}
          </h2>
          <FieldLabel htmlFor="images">
            {hi ? "इमेज URLs (एक प्रति पंक्ति)" : "Image URLs (one per line)"}
          </FieldLabel>
          <textarea
            id="images" name="images"
            placeholder={"https://example.com/image1.jpg\nhttps://example.com/image2.jpg"}
            className={textareaCls}
            style={{ minHeight: 80 }}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            {hi
              ? "सार्वजनिक इमेज URLs पेस्ट करें। पहली इमेज कवर फ़ोटो होगी।"
              : "Paste publicly accessible image URLs. First image will be the cover photo."}
          </p>
        </section>

        {/* ── Contact ── */}
        <section className="rounded-xl border bg-card p-5">
          <h2 className="mb-4 font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {hi ? "संपर्क जानकारी" : "Contact Information"}
          </h2>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel htmlFor="contact_name" required>
                  {hi ? "आपका नाम" : "Your Name"}
                </FieldLabel>
                <input
                  id="contact_name" name="contact_name" type="text" required
                  placeholder={hi ? "मालिक या एजेंट का नाम" : "Owner or agent name"}
                  className={inputCls}
                />
              </div>
              <div>
                <FieldLabel htmlFor="contact_phone">
                  {hi ? "फ़ोन नंबर" : "Phone Number"}
                </FieldLabel>
                <input
                  id="contact_phone" name="contact_phone" type="tel"
                  placeholder={hi ? "10 अंकों का मोबाइल" : "10-digit mobile"}
                  className={inputCls}
                />
              </div>
            </div>
            <div>
              <FieldLabel htmlFor="contact_email" required>
                {hi ? "ईमेल पता" : "Email Address"}
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
            ? "लिस्टिंग प्रकाशन से पहले समीक्षा होती है। सभी जानकारी सटीक रखें।"
            : "Listings are reviewed before publishing. Ensure all information is accurate."}
        </p>
      </form>
    </div>
  )
}
