"use server"

import {
  adminCreateElection, adminUpdateElection, adminAdvancePhase,
  adminAddPosition, adminDeletePosition,
  adminAddCandidate, adminDeleteCandidate, adminToggleWinner,
  adminDeleteElection,
} from "@/lib/supabase/elections"
import { revalidatePath } from "next/cache"
import { revalidateTag } from "next/cache"

function revalidateAll() {
  revalidatePath("/admin/elections")
  revalidateTag("elections")
  revalidatePath("/election")
  revalidatePath("/")
}

export async function createElectionAction(formData: FormData) {
  const title       = (formData.get("title") as string).trim()
  const title_hi    = (formData.get("title_hi") as string)?.trim() || undefined
  const description = (formData.get("description") as string)?.trim() || undefined
  const organization = (formData.get("organization") as string)?.trim() || undefined

  if (!title) return
  await adminCreateElection({ title, title_hi, description, organization })
  revalidateAll()
}

export async function advancePhaseAction(id: string) {
  await adminAdvancePhase(id)
  revalidateAll()
}

export async function updateAnnouncementAction(id: string, formData: FormData) {
  const announcement    = (formData.get("announcement") as string)?.trim() || null
  const announcement_hi = (formData.get("announcement_hi") as string)?.trim() || null
  await adminUpdateElection(id, { announcement, announcement_hi })
  revalidateAll()
}

export async function addPositionAction(election_id: string, formData: FormData) {
  const title      = (formData.get("title") as string).trim()
  const title_hi   = (formData.get("title_hi") as string)?.trim() || undefined
  const seats      = parseInt(formData.get("seats") as string, 10) || 1
  const sort_order = parseInt(formData.get("sort_order") as string, 10) || 0

  if (!title) return
  await adminAddPosition({ election_id, title, title_hi, seats, sort_order })
  revalidateAll()
}

export async function deletePositionAction(id: string) {
  await adminDeletePosition(id)
  revalidateAll()
}

export async function addCandidateAction(election_id: string, formData: FormData) {
  const name        = (formData.get("name") as string).trim()
  const name_hi     = (formData.get("name_hi") as string)?.trim() || undefined
  const position_id = (formData.get("position_id") as string) || undefined
  const photo_url   = (formData.get("photo_url") as string)?.trim() || undefined
  const bio         = (formData.get("bio") as string)?.trim() || undefined

  if (!name) return
  await adminAddCandidate({ election_id, name, name_hi, position_id, photo_url, bio })
  revalidateAll()
}

export async function deleteCandidateAction(id: string) {
  await adminDeleteCandidate(id)
  revalidateAll()
}

export async function toggleWinnerAction(id: string, isWinner: boolean) {
  await adminToggleWinner(id, isWinner)
  revalidateAll()
}

export async function deleteElectionAction(id: string) {
  await adminDeleteElection(id)
  revalidateAll()
}
