import User from '~~/server/models/User'
import { verifyJwt } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'token')
  if (!token) return { user: null }

  const { jwtSecret } = useRuntimeConfig()
  const payload = verifyJwt<{ sub: string }>(token, jwtSecret)
  if (!payload?.sub) return { user: null }

  const user = await User.findById(payload.sub).lean()
  if (!user || Array.isArray(user)) return { user: null }

  return { user: { _id: String(user._id), email: user.email, name: user.name } }
})
