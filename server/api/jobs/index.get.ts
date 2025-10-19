import Job from '~~/server/models/Job'
import { requireUserId } from '~~/server/utils/session'

export default defineEventHandler(async (event) => {
  const userId = requireUserId(event)
  const jobs = await Job.find({ userId }).sort({ appliedAt: -1, number: -1 }).lean()
  return { jobs }
})
