"use client"

import { useState, useTransition, useRef } from "react"
import { toggleReactionAction } from "@/app/news/[slug]/actions"

interface ReactionsState {
  up: number
  down: number
  userReaction: "up" | "down" | null
}

interface ArticleReactionsProps {
  targetType: "article" | "comment"
  targetId: string
  initialUp: number
  initialDown: number
  initialUserReaction: "up" | "down" | null
  isLoggedIn: boolean
  loginHref: string
  compact?: boolean
}

function computeOptimistic(
  state: ReactionsState,
  reaction: "up" | "down"
): ReactionsState {
  const cur = state.userReaction
  let { up, down } = state

  if (cur === reaction) {
    if (reaction === "up") up = Math.max(0, up - 1)
    else down = Math.max(0, down - 1)
    return { up, down, userReaction: null }
  }

  if (cur === "up") up = Math.max(0, up - 1)
  if (cur === "down") down = Math.max(0, down - 1)
  if (reaction === "up") up++
  else down++

  return { up, down, userReaction: reaction }
}

export function ArticleReactions({
  targetType,
  targetId,
  initialUp,
  initialDown,
  initialUserReaction,
  isLoggedIn,
  loginHref,
  compact = false,
}: ArticleReactionsProps) {
  const [state, setState] = useState<ReactionsState>({
    up:           initialUp,
    down:         initialDown,
    userReaction: initialUserReaction,
  })
  const prevRef = useRef(state)
  const [isPending, startTransition] = useTransition()

  function handleReaction(reaction: "up" | "down") {
    if (isPending) return
    prevRef.current = state
    setState(computeOptimistic(state, reaction))

    startTransition(async () => {
      try {
        const result = await toggleReactionAction(targetType, targetId, reaction)
        setState(result)
      } catch {
        setState(prevRef.current)
      }
    })
  }

  const btn = (r: "up" | "down") => {
    const active = state.userReaction === r
    const base = compact
      ? "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors"
      : "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors"

    const color = active
      ? r === "up"
        ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300"
        : "bg-red-100 text-red-600 ring-1 ring-red-300"
      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"

    return `${base} ${color} ${isPending ? "opacity-60" : "cursor-pointer"}`
  }

  const count = compact
    ? (n: number) => (n > 0 ? n : "")
    : (n: number) => n

  if (!isLoggedIn) {
    return (
      <div className="flex items-center gap-1.5">
        <a href={loginHref} className={btn("up")} title="Sign in to react">
          👍 <span>{count(state.up)}</span>
        </a>
        <a href={loginHref} className={btn("down")} title="Sign in to react">
          👎 <span>{count(state.down)}</span>
        </a>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => handleReaction("up")}
        className={btn("up")}
        disabled={isPending}
        title={state.userReaction === "up" ? "Remove upvote" : "Upvote"}
      >
        👍 <span>{count(state.up)}</span>
      </button>
      <button
        onClick={() => handleReaction("down")}
        className={btn("down")}
        disabled={isPending}
        title={state.userReaction === "down" ? "Remove downvote" : "Downvote"}
      >
        👎 <span>{count(state.down)}</span>
      </button>
    </div>
  )
}
