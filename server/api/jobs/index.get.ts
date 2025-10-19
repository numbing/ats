import Job from '~~/server/models/Job'
import { requireUserId } from '~~/server/utils/session'
import mongoose from 'mongoose'

export default defineEventHandler(async (event) => {
  const userId = requireUserId(event)
  const { q } = getQuery(event) as { q?: string }

  // base filter: current user
  const filter: any = { userId }

  // if q present, do case-insensitive substring on company
  if (q && typeof q === 'string' && q.trim()) {
    // Escape regex special chars to avoid ReDoS-y patterns
    const safe = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    filter.company = { $regex: safe, $options: 'i' }
  }

  // sort newest first; adjust if you prefer
  const jobs = await Job.find(filter).sort({ createdAt: -1 }).lean()

  // normalize _id to string for frontend
  const normalized = jobs.map(j => ({ ...j, _id: String(j._id) }))
  return { jobs: normalized }
})
