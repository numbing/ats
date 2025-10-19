// server/models/User.ts
import _mongoose from 'mongoose'
// ✅ works whether mongoose is CJS or ESM
const mongoose: typeof _mongoose = ( (_mongoose as any).default ?? _mongoose )
const { Schema, model, models } = mongoose

export interface IUser {
  _id?: string
  email: string
  password: string
  name?: string
  createdAt?: Date
  updatedAt?: Date
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    name: { type: String }
  },
  { timestamps: true }
)

export default models.User || model<IUser>('User', UserSchema)
