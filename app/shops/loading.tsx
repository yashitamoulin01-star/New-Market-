function ShopCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border bg-card overflow-hidden">
      <div className="h-36 bg-muted" />
      <div className="p-4 space-y-2">
        <div className="flex gap-3">
          <div className="h-10 w-10 rounded-lg bg-muted shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-16 rounded-full bg-muted" />
            <div className="h-4 w-32 rounded bg-muted" />
          </div>
        </div>
        <div className="h-3 w-full rounded bg-muted" />
        <div className="h-3 w-2/3 rounded bg-muted" />
        <div className="flex gap-1 mt-1">
          {[...Array(3)].map((_, i) => <div key={i} className="h-4 w-12 rounded-full bg-muted" />)}
        </div>
      </div>
    </div>
  )
}

export default function ShopsLoading() {
  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="h-7 w-40 animate-pulse rounded bg-muted" />
        <div className="h-9 w-28 animate-pulse rounded-full bg-muted" />
      </div>
      <div className="mb-6 flex flex-wrap gap-1.5">
        {[...Array(14)].map((_, i) => (
          <div key={i} className="h-7 w-24 animate-pulse rounded-full bg-muted" />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(8)].map((_, i) => <ShopCardSkeleton key={i} />)}
      </div>
    </div>
  )
}
