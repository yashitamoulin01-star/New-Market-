"use client"

import { useEffect } from "react"
import { AlertTriangle } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <AlertTriangle size={40} className="mb-4 text-amber-500" />
      <h2 className="mb-2 font-heading text-xl font-bold">Something went wrong</h2>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">
        An unexpected error occurred. This is likely a temporary issue — please try again.
      </p>
      <button
        onClick={reset}
        className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
      >
        Try again
      </button>
    </div>
  )
}
