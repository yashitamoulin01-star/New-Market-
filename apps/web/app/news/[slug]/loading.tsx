export default function ArticleLoading() {
  return (
    <div className="container max-w-3xl py-8 animate-pulse">
      {/* Back link */}
      <div className="mb-6 h-4 w-28 rounded-full bg-muted" />

      {/* Category badge */}
      <div className="mb-3 flex gap-2">
        <div className="h-6 w-20 rounded-full bg-muted" />
      </div>

      {/* Title */}
      <div className="mb-2 space-y-2.5">
        <div className="h-7 w-full rounded-lg bg-muted" />
        <div className="h-7 w-4/5 rounded-lg bg-muted" />
      </div>

      {/* Meta row */}
      <div className="mb-6 flex gap-4">
        <div className="h-4 w-24 rounded-full bg-muted" />
        <div className="h-4 w-20 rounded-full bg-muted" />
        <div className="h-4 w-16 rounded-full bg-muted" />
      </div>

      {/* Reactions */}
      <div className="mb-6 h-8 w-32 rounded-lg bg-muted" />

      {/* Cover image */}
      <div className="mb-8 h-64 w-full rounded-xl bg-muted sm:h-72 lg:h-96" />

      {/* Body paragraphs */}
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-full rounded bg-muted" />
            <div className={`h-4 rounded bg-muted ${i % 2 === 0 ? "w-3/4" : "w-5/6"}`} />
          </div>
        ))}
      </div>

      {/* Comments section skeleton */}
      <div className="mt-12 border-t pt-8">
        <div className="mb-6 h-6 w-32 rounded-lg bg-muted" />
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex gap-3 rounded-xl border p-4">
              <div className="h-8 w-8 shrink-0 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 rounded bg-muted" />
                <div className="h-4 w-full rounded bg-muted" />
                <div className="h-4 w-2/3 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
