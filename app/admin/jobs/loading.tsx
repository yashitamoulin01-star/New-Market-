export default function AdminJobsLoading() {
  return (
    <div className="container py-8 animate-pulse">
      <div className="mb-6 flex items-center gap-3">
        <div className="h-6 w-6 rounded bg-muted" />
        <div className="h-7 w-16 rounded-lg bg-muted" />
        <div className="h-6 w-10 rounded-full bg-muted" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-start gap-4 rounded-xl border p-4">
            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/3 rounded bg-muted" />
              <div className="h-3 w-1/2 rounded bg-muted" />
            </div>
            <div className="flex gap-2">
              <div className="h-7 w-16 rounded-lg bg-muted" />
              <div className="h-7 w-16 rounded-lg bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
