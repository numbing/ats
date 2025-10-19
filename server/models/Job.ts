import _mongoose from 'mongoose'
const mongoose: typeof _mongoose = ((_mongoose as any).default ?? _mongoose)
const { Schema, model, models } = mongoose

export interface IJob {
  _id?: string
  userId: string
  company: string
  notes?: string
  appliedAt: Date
  number: number  // per-user running number (1,2,3…)
  createdAt?: Date
  updatedAt?: Date
}

const JobSchema = new Schema<IJob>({
  userId: { type: String, required: true, index: true },
  company: { type: String, required: true, trim: true },
  notes: { type: String, default: '' },
  appliedAt: { type: Date, required: true, default: () => new Date() },
  number: { type: Number, required: true }
}, { timestamps: true })

export default models.Job || model<IJob>('Job', JobSchema)
