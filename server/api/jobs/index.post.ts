import Job from '~~/server/models/Job'
import { requireUserId } from '~~/server/utils/session'

export default defineEventHandler(async (event) => {
  const userId = requireUserId(event)
  const body = await readBody(event) as { company?: string; notes?: string; appliedAt?: string | Date }

  if (!body?.company || typeof body.company !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'company is required' })
  }

  // next compact number = count + 1
  const count = await Job.countDocuments({ userId })
  const appliedAt = body.appliedAt ? new Date(body.appliedAt) : new Date()

  const job = await Job.create({
    userId,
    company: body.company.trim(),
    notes: body.notes ?? '',
    appliedAt,
  })

  return { job: { ...job.toObject(), _id: String(job._id) } }
})
