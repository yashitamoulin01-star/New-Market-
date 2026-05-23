import type { ElementType, ReactNode } from "react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import {
  getUserNews, getUserJobs, getUserShops,
  getUserProperties, getUserComments,
} from "@/lib/supabase/user-content"
import { T } from "@/components/ui/t"
import { Newspaper, Briefcase, Store, Building2, MessageSquare, CheckCircle2, Clock, XCircle, Trash2 } from "lucide-react"
import {
  deleteMyNewsAction,
  deleteMyJobAction,
  deleteMyShopAction,
  deleteMyPropertyAction,
  deleteMyCommentAction,
} from "./actions"

function StatusBadge({ status }: { status: string }) {
  if (status === "APPROVED")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">
        <CheckCircle2 size={10} />
        <T en="Approved" hi="स्वीकृत" />
      </span>
    )
  if (status === "REJECTED")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-700">
        <XCircle size={10} />
        <T en="Rejected" hi="अस्वीकृत" />
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
      <Clock size={10} />
      <T en="Pending" hi="समीक्षाधीन" />
    </span>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <p className="py-8 text-center text-sm text-muted-foreground">{label}</p>
  )
}

export default async function MyStuffPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login?redirect=/my-stuff")

  const email = user.email ?? ""
  const userId = user.id
  const name = (user.user_metadata?.full_name as string | undefined) ?? email.split("@")[0]

  const [myNews, myJobs, myShops, myProperties, myComments] = await Promise.all([
    getUserNews(email),
    getUserJobs(email),
    getUserShops(email),
    getUserProperties(email),
    getUserComments(userId),
  ])

  const tabs = [
    { id: "news",       icon: Newspaper,     en: "My News",       hi: "मेरे समाचार",   count: myNews.length },
    { id: "jobs",       icon: Briefcase,     en: "My Jobs",       hi: "मेरी नौकरियाँ", count: myJobs.length },
    { id: "shops",      icon: Store,         en: "My Shops",      hi: "मेरी दुकानें",  count: myShops.length },
    { id: "properties", icon: Building2,     en: "My Properties", hi: "मेरी संपत्तियाँ", count: myProperties.length },
    { id: "comments",   icon: MessageSquare, en: "My Comments",   hi: "मेरी टिप्पणियाँ", count: myComments.length },
  ]

  return (
    <div className="container max-w-4xl py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          <T en="My Stuff" hi="मेरा कोना" />
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          <T en={`Welcome, ${name}`} hi={`स्वागत है, ${name}`} />
        </p>
      </div>

      {/* Summary cards */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {tabs.map(({ id, icon: Icon, en, hi, count }) => (
          <div
            key={id}
            className="rounded-xl border bg-card p-4 text-center shadow-sm"
          >
            <Icon size={18} className="mx-auto mb-1.5 text-primary" />
            <p className="text-xl font-bold">{count}</p>
            <p className="text-[11px] text-muted-foreground">
              <T en={en} hi={hi} />
            </p>
          </div>
        ))}
      </div>

      {/* News */}
      <Section title={{ en: "My News Submissions", hi: "मेरे समाचार" }} icon={Newspaper}>
        {myNews.length === 0 ? (
          <EmptyState label="No news submissions yet." />
        ) : (
          <ul className="divide-y">
            {myNews.map((item) => {
              const deleteAction = deleteMyNewsAction.bind(null, item.id)
              return (
                <li key={item.id} className="flex items-start justify-between gap-4 py-3">
                  <div className="min-w-0 flex-1">
                    {item.status === "APPROVED" ? (
                      <Link
                        href={`/news/${item.slug}`}
                        className="text-sm font-medium hover:text-primary transition-colors line-clamp-1"
                      >
                        {item.title}
                      </Link>
                    ) : (
                      <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                    )}
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {item.category} · {new Date(item.created_at).toLocaleDateString("en-IN")}
                    </p>
                    {item.rejection_note && (
                      <p className="mt-1 text-[11px] text-destructive">
                        <T en="Reason:" hi="कारण:" /> {item.rejection_note}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusBadge status={item.status} />
                    {item.status !== "APPROVED" && (
                      <form action={deleteAction}>
                        <button type="submit" className="rounded border border-red-200 p-1 text-red-500 transition hover:bg-red-50" title="Delete">
                          <Trash2 size={12} />
                        </button>
                      </form>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
        <div className="mt-3 border-t pt-3">
          <Link
            href="/news/submit"
            className="text-xs font-medium text-primary hover:underline"
          >
            + <T en="Submit a new story" hi="नया समाचार भेजें" />
          </Link>
        </div>
      </Section>

      {/* Jobs */}
      <Section title={{ en: "My Job Listings", hi: "मेरी नौकरियाँ" }} icon={Briefcase}>
        {myJobs.length === 0 ? (
          <EmptyState label="No job listings yet." />
        ) : (
          <ul className="divide-y">
            {myJobs.map((item) => {
              const deleteAction = deleteMyJobAction.bind(null, item.id)
              return (
                <li key={item.id} className="flex items-start justify-between gap-4 py-3">
                  <div className="min-w-0 flex-1">
                    {item.status === "APPROVED" ? (
                      <Link
                        href={`/jobs/${item.id}`}
                        className="text-sm font-medium hover:text-primary transition-colors line-clamp-1"
                      >
                        {item.title}
                      </Link>
                    ) : (
                      <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                    )}
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {item.shop_name} · {new Date(item.created_at).toLocaleDateString("en-IN")}
                    </p>
                    {item.rejection_note && (
                      <p className="mt-1 text-[11px] text-destructive">
                        <T en="Reason:" hi="कारण:" /> {item.rejection_note}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusBadge status={item.status} />
                    <form action={deleteAction}>
                      <button type="submit" className="rounded border border-red-200 p-1 text-red-500 transition hover:bg-red-50" title="Delete">
                        <Trash2 size={12} />
                      </button>
                    </form>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
        <div className="mt-3 border-t pt-3">
          <Link
            href="/jobs/post"
            className="text-xs font-medium text-primary hover:underline"
          >
            + <T en="Post a new job" hi="नई नौकरी पोस्ट करें" />
          </Link>
        </div>
      </Section>

      {/* Shops */}
      <Section title={{ en: "My Shops", hi: "मेरी दुकानें" }} icon={Store}>
        {myShops.length === 0 ? (
          <EmptyState label="No shops listed yet." />
        ) : (
          <ul className="divide-y">
            {myShops.map((item) => {
              const deleteAction = deleteMyShopAction.bind(null, item.id)
              return (
                <li key={item.id} className="flex items-start justify-between gap-4 py-3">
                  <div className="min-w-0 flex-1">
                    {item.status === "APPROVED" ? (
                      <Link
                        href={`/shops/${item.id}`}
                        className="text-sm font-medium hover:text-primary transition-colors line-clamp-1"
                      >
                        {item.name}
                      </Link>
                    ) : (
                      <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                    )}
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {item.category} · {new Date(item.created_at).toLocaleDateString("en-IN")}
                    </p>
                    {item.rejection_note && (
                      <p className="mt-1 text-[11px] text-destructive">
                        <T en="Reason:" hi="कारण:" /> {item.rejection_note}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusBadge status={item.status} />
                    <form action={deleteAction}>
                      <button type="submit" className="rounded border border-red-200 p-1 text-red-500 transition hover:bg-red-50" title="Delete">
                        <Trash2 size={12} />
                      </button>
                    </form>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
        <div className="mt-3 border-t pt-3">
          <Link
            href="/shops/add"
            className="text-xs font-medium text-primary hover:underline"
          >
            + <T en="Add a shop" hi="दुकान जोड़ें" />
          </Link>
        </div>
      </Section>

      {/* Properties */}
      <Section title={{ en: "My Properties", hi: "मेरी संपत्तियाँ" }} icon={Building2}>
        {myProperties.length === 0 ? (
          <EmptyState label="No property listings yet." />
        ) : (
          <ul className="divide-y">
            {myProperties.map((item) => {
              const deleteAction = deleteMyPropertyAction.bind(null, item.id)
              return (
                <li key={item.id} className="flex items-start justify-between gap-4 py-3">
                  <div className="min-w-0 flex-1">
                    {item.status === "APPROVED" ? (
                      <Link
                        href={`/property/${item.id}`}
                        className="text-sm font-medium hover:text-primary transition-colors line-clamp-1"
                      >
                        {item.title}
                      </Link>
                    ) : (
                      <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                    )}
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {item.listing_type} · {item.property_type} · {new Date(item.created_at).toLocaleDateString("en-IN")}
                    </p>
                    {item.rejection_note && (
                      <p className="mt-1 text-[11px] text-destructive">
                        <T en="Reason:" hi="कारण:" /> {item.rejection_note}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusBadge status={item.status} />
                    <form action={deleteAction}>
                      <button type="submit" className="rounded border border-red-200 p-1 text-red-500 transition hover:bg-red-50" title="Delete">
                        <Trash2 size={12} />
                      </button>
                    </form>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
        <div className="mt-3 border-t pt-3">
          <Link
            href="/property/list"
            className="text-xs font-medium text-primary hover:underline"
          >
            + <T en="List a property" hi="संपत्ति लिस्ट करें" />
          </Link>
        </div>
      </Section>

      {/* Comments */}
      <Section title={{ en: "My Comments", hi: "मेरी टिप्पणियाँ" }} icon={MessageSquare}>
        {myComments.length === 0 ? (
          <EmptyState label="No comments yet." />
        ) : (
          <ul className="divide-y">
            {myComments.map((item) => {
              const deleteAction = deleteMyCommentAction.bind(null, item.id)
              return (
                <li key={item.id} className="py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/news/${item.article_slug}#comments`}
                        className="text-xs font-medium text-primary hover:underline line-clamp-1"
                      >
                        {item.article_title}
                      </Link>
                      <p className="mt-1 text-sm text-foreground/80 line-clamp-2">{item.content}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {new Date(item.created_at).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </p>
                    </div>
                    <form action={deleteAction} className="shrink-0 pt-0.5">
                      <button type="submit" className="rounded border border-red-200 p-1 text-red-500 transition hover:bg-red-50" title="Delete comment">
                        <Trash2 size={12} />
                      </button>
                    </form>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Section>
    </div>
  )
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: { en: string; hi: string }
  icon: ElementType
  children: ReactNode
}) {
  return (
    <section className="mb-8 rounded-xl border bg-card p-5 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 text-base font-bold">
        <Icon size={16} className="text-primary" />
        <T en={title.en} hi={title.hi} />
      </h2>
      {children}
    </section>
  )
}
