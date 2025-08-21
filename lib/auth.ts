import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getCollection } from './db'

// Ensure JWT_SECRET is set
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-development-only'

export interface JWTPayload {
  userId: string
  email: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export async function authenticateUser(email: string, password: string) {
  const users = await getCollection('User')
  const profiles = await getCollection('UserProfile')

  const userDoc = await users.findOne<any>({ email })
  if (!userDoc) return null

  const isValid = await verifyPassword(password, userDoc.password)
  if (!isValid) return null

  const profileDoc = await profiles.findOne<any>({ userId: String(userDoc._id) })

  const user = {
    id: String(userDoc._id),
    email: userDoc.email,
    password: userDoc.password,
    firstName: userDoc.firstName,
    lastName: userDoc.lastName,
    createdAt: userDoc.createdAt,
    updatedAt: userDoc.updatedAt,
    profile: profileDoc || null
  }

  return user
}