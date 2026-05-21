"use client"

import Link from "next/link"
import { Newspaper, Briefcase } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { translations as t } from "@/lib/i18n"

export function HomeCta() {
  const { lang } = useLanguage()
  return (
    <section className="border-t bg-[#f7f3ef] py-14 text-center">
      <div className="container max-w-xl">
        <h2 className="mb-2 font-heading text-xl font-bold">
          {t.sections.happening[lang]}
        </h2>
        <p className="mb-7 text-sm text-muted-foreground">
          {t.sections.happeningSub[lang]}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/news/submit"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            <Newspaper size={15} />
            {t.sections.submitStory[lang]}
          </Link>
          <Link
            href="/jobs/post"
            className="inline-flex items-center gap-2 rounded-full border px-6 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
          >
            <Briefcase size={15} />
            {t.sections.postJob[lang]}
          </Link>
        </div>
      </div>
    </section>
  )
}
