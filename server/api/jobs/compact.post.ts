// server/api/jobs/compact.post.ts
import Job from '~~/server/models/Job'
import { requireUserId } from '~~/server/utils/session'

export default defineEventHandler(async (event) => {
  const userId = requireUserId(event)
  const items = await Job.find({ userId }).sort({ appliedAt: 1, createdAt: 1, number: 1 }).select({ _id: 1 }).lean()
  await Promise.all(items.map((doc, i) => Job.updateOne({ _id: doc._id }, { $set: { number: i + 1 } })))
  return { ok: true, total: items.length }
})
