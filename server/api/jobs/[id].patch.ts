import Job from '~~/server/models/Job'
import { requireUserId } from '~~/server/utils/session'
import { z } from 'zod'
import mongoose from 'mongoose'

const patchSchema = z.object({
  company: z.string().trim().min(1).optional(),
  notes: z.string().optional(),
  appliedAt: z.coerce.date().optional(),
}).strict()

export default defineEventHandler(async (event) => {
  const userId = requireUserId(event)
  const id = getRouterParam(event, 'id')!

  // reject invalid ids early
  if (!mongoose.isValidObjectId(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid id' })
  }

  const parsed = patchSchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid body' })
  }

  // build $set only for provided keys
  const $set: Record<string, unknown> = {}
  if (parsed.data.company !== undefined) $set.company = parsed.data.company
  if (parsed.data.notes !== undefined) $set.notes = parsed.data.notes
  if (parsed.data.appliedAt !== undefined) $set.appliedAt = parsed.data.appliedAt

  // no fields to update
  if (Object.keys($set).length === 0) {
    const existing = await Job.findOne({ _id: id, userId }).lean()
    if (!existing) throw createError({ statusCode: 404, statusMessage: 'Not found' })
    return { job: { ...existing, _id: String(existing._id) } }
  }

  const updated = await Job.findOneAndUpdate(
    { _id: id, userId },
    { $set },
    { new: true, runValidators: true }
  ).lean()

  if (!updated) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  return { job: { ...updated, _id: String(updated._id) } }
})
