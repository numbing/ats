import Job from '~~/server/models/Job'
import { requireUserId } from '~~/server/utils/session'

export default defineEventHandler(async (event) => {
  const userId = requireUserId(event)
  const id = getRouterParam(event, 'id')!
  const body = await readBody(event) as Partial<{ company: string; notes: string; appliedAt: string | Date }>

  const job = await Job.findOne({ _id: id, userId })
  if (!job) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  if (typeof body.company === 'string') job.company = body.company.trim()
  if (typeof body.notes === 'string') job.notes = body.notes
  if (body.appliedAt) job.appliedAt = new Date(body.appliedAt)

  await job.save()
  return { job: { ...job.toObject(), _id: String(job._id) } }
})
