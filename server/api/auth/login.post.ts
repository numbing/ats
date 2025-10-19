import User from '~~/server/models/User'
import { loginSchema } from '~~/server/utils/validation'
import { verifyPassword, signJwt } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: 'Invalid input' })

  const { email, password } = parsed.data
  const user = await User.findOne({ email })
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })

  const ok = await verifyPassword(password, user.password)
  if (!ok) throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })

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
