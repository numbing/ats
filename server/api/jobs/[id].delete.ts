import Job from '~~/server/models/Job'
import { requireUserId } from '~~/server/utils/session'

export default defineEventHandler(async (event) => {
  const userId = requireUserId(event)
  const id = getRouterParam(event, 'id')!

  const res = await Job.deleteOne({ _id: id, userId })
  if (res.deletedCount !== 1) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  // Re-number compactly: 1..N by appliedAt (then createdAt/number as tie-breakers)
  const remaining = await Job.find({ userId })
    .sort({ appliedAt: 1, createdAt: 1, number: 1 }) // choose the order you want
    .select({ _id: 1 })
    .lean()

  // assign 1..N
  // (small per-user lists: simple loop is fine)
  await Promise.all(
    remaining.map((doc, idx) =>
      Job.updateOne({ _id: doc._id }, { $set: { number: idx + 1 } })
    )
  )

  return { ok: true }
})
