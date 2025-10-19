import { Schema, model, models } from 'mongoose'

export interface IUser {
  _id?: string
  email: string
  password: string
  name?: string
  createdAt?: Date
  updatedAt?: Date
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  name: { type: String }
}, { timestamps: true })

export default models.User || model<IUser>('User', UserSchema)
