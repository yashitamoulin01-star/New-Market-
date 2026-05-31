"use client"

import Link from "next/link"
import { useState } from "react"
import { ShieldCheck } from "lucide-react"

interface Props {
  lang?: string
  onChecked?: (checked: boolean) => void
}

export function SubmissionConsent({ lang = "en", onChecked }: Props) {
  const hi = lang === "hi"
  const [agreed, setAgreed] = useState(false)

  function handleChange(checked: boolean) {
    setAgreed(checked)
    onChecked?.(checked)
  }

  return (
    <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <ShieldCheck size={15} className="text-amber-700 dark:text-amber-400 shrink-0" />
        <h3 className="text-sm font-bold text-amber-900 dark:text-amber-300">
          {hi ? "सामुदायिक दिशा-निर्देश और सबमिशन सहमति" : "Community Guidelines & Submission Agreement"}
        </h3>
      </div>

      <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-white/60 dark:bg-black/20 p-3 max-h-48 overflow-y-auto text-xs text-foreground/80 space-y-2 scrollbar-thin">
        {hi ? (
          <>
            <p className="font-medium">NewMarket.co.in पर सामग्री सबमिट करके आप पुष्टि करते हैं कि:</p>
            <ul className="space-y-1 list-disc list-inside text-foreground/70">
              <li>आपके द्वारा दी गई जानकारी आपकी जानकारी के अनुसार सटीक है।</li>
              <li>आप प्रस्तुत की जा रही सामग्री के स्वामी हैं या उसे प्रकाशित करने की अनुमति आपके पास है।</li>
              <li>आपकी सामग्री में कोई अवैध, अपमानजनक, घृणास्पद, भ्रामक, मानहानिकारक, कॉपीराइटेड या हानिकारक सामग्री नहीं है।</li>
            </ul>

            <p className="font-medium pt-1">NewMarket.co.in को निम्नलिखित अधिकार प्राप्त हैं:</p>
            <ul className="grid grid-cols-2 gap-x-3 gap-y-0.5 list-disc list-inside text-foreground/70">
              <li>समीक्षा और संपादन</li>
              <li>अस्वीकृति और हटाना</li>
              <li>सामग्री छुपाना</li>
              <li>प्रशासन और नियंत्रण</li>
              <li>फ़ीचर और पुनः स्थापन</li>
              <li>संक्षेप और पुनःस्वरूपण</li>
              <li>वर्तनी/व्याकरण सुधार</li>
              <li>लेबल/श्रेणी जोड़ना</li>
              <li>दृश्यता अक्षम करना</li>
              <li>स्थायी हटाना</li>
            </ul>
            <p className="text-foreground/60 text-[11px] pt-1">…बिना किसी पूर्व सूचना के।</p>

            <ul className="space-y-1 list-disc list-inside text-foreground/70 pt-1">
              <li>सबमिशन प्रकाशन की <strong>गारंटी नहीं</strong> है।</li>
              <li>सभी सबमिशन लाइव होने से पहले प्रशासक द्वारा अनुमोदन के अधीन हैं।</li>
              <li>NewMarket.co.in प्रस्तुत सामग्री का उपयोग प्रदर्शन, प्रचार, प्रशासन, संपादकीय और परिचालन उद्देश्यों के लिए कर सकता है।</li>
              <li>आप अपनी सबमिट की गई सामग्री के लिए स्वयं उत्तरदायी हैं।</li>
            </ul>
          </>
        ) : (
          <>
            <p className="font-medium">By submitting content on NewMarket.co.in, you confirm that:</p>
            <ul className="space-y-1 list-disc list-inside text-foreground/70">
              <li>The information provided is accurate to the best of your knowledge.</li>
              <li>You own the content being submitted OR have permission to publish it.</li>
              <li>Your submission does not contain illegal, abusive, hateful, misleading, defamatory, copyrighted, or harmful material.</li>
            </ul>

            <p className="font-medium pt-1">NewMarket.co.in reserves the right to:</p>
            <ul className="grid grid-cols-2 gap-x-3 gap-y-0.5 list-disc list-inside text-foreground/70">
              <li>Review &amp; edit</li>
              <li>Reject &amp; remove</li>
              <li>Unpublish content</li>
              <li>Moderate submissions</li>
              <li>Feature &amp; reposition</li>
              <li>Shorten &amp; reformat</li>
              <li>Correct spelling/grammar</li>
              <li>Add labels/categories</li>
              <li>Disable visibility</li>
              <li>Delete permanently</li>
            </ul>
            <p className="text-foreground/60 text-[11px] pt-1">…without prior notice.</p>

            <ul className="space-y-1 list-disc list-inside text-foreground/70 pt-1">
              <li>Submission does <strong>NOT</strong> guarantee publication.</li>
              <li>All submissions are subject to admin approval before going live.</li>
              <li>NewMarket.co.in may use submitted content across the platform for display, promotional, moderation, editorial, and operational purposes.</li>
              <li>You remain responsible for the content you submit.</li>
            </ul>
          </>
        )}
      </div>

      <label className="flex cursor-pointer items-start gap-2.5">
        <input
          type="checkbox"
          name="consent_accepted"
          value="true"
          checked={agreed}
          onChange={(e) => handleChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-primary shrink-0"
          required
        />
        <span className="text-xs text-foreground/80">
          {hi ? (
            <>
              मैंने{" "}
              <Link href="/guidelines" target="_blank" className="font-semibold text-primary hover:underline">सामुदायिक नियम</Link>
              {", "}
              <Link href="/terms" target="_blank" className="font-semibold text-primary hover:underline">सेवा की शर्तें</Link>
              {" और "}
              <Link href="/privacy" target="_blank" className="font-semibold text-primary hover:underline">गोपनीयता नीति</Link>
              {" पढ़े और सहमत हूँ। मैं समझता/समझती हूँ कि NewMarket.co.in मेरी सबमिशन को समीक्षा, संपादन, प्रकाशन या हटाने के लिए स्वतंत्र है।"}
            </>
          ) : (
            <>
              I have read and agree to the{" "}
              <Link href="/guidelines" target="_blank" className="font-semibold text-primary hover:underline">Community Guidelines</Link>
              {", "}
              <Link href="/terms" target="_blank" className="font-semibold text-primary hover:underline">Terms of Service</Link>
              {", and "}
              <Link href="/privacy" target="_blank" className="font-semibold text-primary hover:underline">Privacy Policy</Link>
              . I understand that NewMarket.co.in may review, edit, moderate, and manage my submission.
            </>
          )}
        </span>
      </label>

      {!agreed && (
        <p className="text-[11px] text-amber-700 dark:text-amber-400">
          {hi ? "सबमिट करने से पहले सहमति आवश्यक है।" : "You must accept the agreement before submitting."}
        </p>
      )}
    </div>
  )
}
