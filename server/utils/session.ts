import { verifyJwt } from '~~/server/utils/auth'

export function requireUserId(event: any): string {
  const token = getCookie(event, 'token')
  if (!token) throw createError({ statusCode: 401, statusMessage: 'Unauthenticated' })

  const { jwtSecret } = useRuntimeConfig()
  const payload = verifyJwt<{ sub: string }>(token, jwtSecret)
  if (!payload?.sub) throw createError({ statusCode: 401, statusMessage: 'Invalid token' })

  return payload.sub
}
