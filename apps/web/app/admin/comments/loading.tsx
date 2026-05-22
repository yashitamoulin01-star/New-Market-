export default function AdminCommentsLoading() {
  return (
    <div className="container py-8 animate-pulse">
      <div className="mb-6 flex items-center gap-3">
        <div className="h-6 w-6 rounded bg-muted" />
        <div className="h-7 w-28 rounded-lg bg-muted" />
        <div className="h-6 w-10 rounded-full bg-muted" />
      </div>
      <div className="mb-6 h-4 w-72 rounded bg-muted" />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 rounded-xl border p-4">
            <div className="h-8 w-8 shrink-0 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="flex gap-3">
                <div className="h-3 w-20 rounded bg-muted" />
                <div className="h-3 w-24 rounded bg-muted" />
              </div>
              <div className="h-4 w-full rounded bg-muted" />
              <div className="h-4 w-2/3 rounded bg-muted" />
            </div>
            <div className="h-8 w-8 shrink-0 rounded-lg bg-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}
