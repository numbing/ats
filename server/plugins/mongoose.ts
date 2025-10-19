// server/plugins/mongoose.ts
import _mongoose from 'mongoose'
import { defineNitroPlugin } from '#imports'

const mongoose: typeof _mongoose = ((_mongoose as any).default ?? _mongoose)

// Optional: nicer error if someone queries before connect
mongoose.set('bufferCommands', false) // don't buffer model ops

export default defineNitroPlugin(async () => {
  const raw = useRuntimeConfig().mongoUri
  const mongoUri = (raw || '').trim()

  if (!mongoUri) {
    console.error('[Mongo] MONGO_URI is empty. Check your .env at project root.')
    return
  }

  if (!(mongoUri.startsWith('mongodb://') || mongoUri.startsWith('mongodb+srv://'))) {
    console.error('[Mongo] Invalid MONGO_URI scheme:', mongoUri.slice(0, 40) + '...')
    return
  }

  // Already connected?
  if (mongoose.connection.readyState === 1) {
    console.log('[Mongo] already connected')
    return
  }

  try {
    console.log('[Mongo] connecting...')
    await mongoose.connect(mongoUri, {
      // Give Atlas more time to elect / wake
      serverSelectionTimeoutMS: 30000, // 30s
      socketTimeoutMS: 45000,
      retryWrites: true
    })
    console.log('[Mongo] connected')
  } catch (err: any) {
    console.error('[Mongo] connection error:', err?.message || err)
  }

  mongoose.connection.on('error', (e) => {
    console.error('[Mongo] runtime error:', e)
  })
})
