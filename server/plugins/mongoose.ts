import mongoose from 'mongoose'
import { defineNitroPlugin } from '#imports'

export default defineNitroPlugin(async () => {
  const { mongoUri } = useRuntimeConfig()
  if (!mongoUri) {
    console.warn('[Mongo] Missing MONGO_URI')
    return
  }
  if (mongoose.connection.readyState === 1) return
  await mongoose.connect(mongoUri)
  console.log('[Mongo] connected')
})
