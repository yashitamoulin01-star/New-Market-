function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border bg-card overflow-hidden">
      <div className="h-48 bg-muted" />
      <div className="p-4 space-y-2">
        <div className="h-3 w-16 rounded-full bg-muted" />
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-3/4 rounded bg-muted" />
        <div className="h-3 w-full rounded bg-muted" />
        <div className="h-3 w-2/3 rounded bg-muted" />
      </div>
    </div>
  )
}

export default function NewsLoading() {
  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="h-6 w-32 animate-pulse rounded bg-muted" />
        <div className="h-8 w-24 animate-pulse rounded-full bg-muted" />
      </div>
      <div className="mb-4 flex gap-2">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="h-7 w-20 animate-pulse rounded-full bg-muted" />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
      </div>
    </div>
  )
}
