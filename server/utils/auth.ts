import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const SALT_ROUNDS = 12

export const hashPassword = (plain: string) => bcrypt.hash(plain, SALT_ROUNDS)
export const verifyPassword = (plain: string, hash: string) => bcrypt.compare(plain, hash)

export const signJwt = (payload: object, secret: string) =>
  jwt.sign(payload, secret, { expiresIn: '7d' })

export function verifyJwt<T = any>(token: string, secret: string): T | null {
  try { return jwt.verify(token, secret) as T } catch { return null }
}
