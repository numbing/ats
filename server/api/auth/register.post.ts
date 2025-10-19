import User from '~~/server/models/User'
import { registerSchema } from '~~/server/utils/validation'
import { hashPassword, signJwt } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: 'Invalid input' })

  const { email, password, name } = parsed.data
  const exists = await User.findOne({ email })
  if (exists) throw createError({ statusCode: 409, statusMessage: 'Email already in use' })

  const hashed = await hashPassword(password)
  const user = await User.create({ email, password: hashed, name })

  const { jwtSecret } = useRuntimeConfig()
  const token = signJwt({ sub: user._id, email: user.email }, jwtSecret)

  setCookie(event, 'token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  })

  return { user: { _id: String(user._id), email: user.email, name: user.name } }
})
