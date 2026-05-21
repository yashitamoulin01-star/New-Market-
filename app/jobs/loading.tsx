function JobCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border bg-card p-4 space-y-3">
      <div className="flex gap-2">
        <div className="h-5 w-20 rounded-full bg-muted" />
        <div className="h-5 w-16 rounded-full bg-muted" />
      </div>
      <div className="h-4 w-full rounded bg-muted" />
      <div className="h-4 w-3/4 rounded bg-muted" />
      <div className="h-3 w-1/2 rounded bg-muted" />
      <div className="h-4 w-28 rounded bg-muted" />
      <div className="flex justify-between">
        <div className="h-3 w-16 rounded bg-muted" />
        <div className="h-3 w-12 rounded bg-muted" />
      </div>
    </div>
  )
}

export default function JobsLoading() {
  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="h-7 w-40 animate-pulse rounded bg-muted" />
        <div className="h-9 w-28 animate-pulse rounded-full bg-muted" />
      </div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {[...Array(11)].map((_, i) => (
          <div key={i} className="h-7 w-20 animate-pulse rounded-full bg-muted" />
        ))}
      </div>
      <div className="mb-6 flex flex-wrap gap-1.5">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-7 w-16 animate-pulse rounded-full bg-muted" />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => <JobCardSkeleton key={i} />)}
      </div>
    </div>
  )
}
