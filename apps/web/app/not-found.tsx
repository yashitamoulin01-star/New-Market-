import Link from "next/link"
import { Home, Newspaper, Briefcase, Store, Building2 } from "lucide-react"

export default function NotFound() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <p className="mb-2 text-6xl font-extrabold text-primary/20">404</p>
      <h1 className="mb-2 font-heading text-2xl font-bold">Page Not Found</h1>
      <p className="mb-8 max-w-sm text-sm text-muted-foreground">
        This page doesn&apos;t exist or may have been moved. Try one of the sections below.
      </p>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: Newspaper,  href: "/news",     label: "News" },
          { icon: Briefcase,  href: "/jobs",     label: "Jobs" },
          { icon: Store,      href: "/shops",    label: "Shops" },
          { icon: Building2,  href: "/property", label: "Property" },
        ].map(({ icon: Icon, href, label }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 text-sm font-medium text-muted-foreground transition hover:border-primary hover:text-primary"
          >
            <Icon size={20} />
            {label}
          </Link>
        ))}
      </div>

      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
      >
        <Home size={14} />
        Back to Home
      </Link>
    </div>
  )
}
