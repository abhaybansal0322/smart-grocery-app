import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getCollection } from '@/lib/db'
import { generateToken, verifyPassword } from '@/lib/auth'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = loginSchema.parse(body)

    const Users = await getCollection('User')
    const email = validatedData.email.trim().toLowerCase()
    const userDoc = await Users.findOne<any>({ email } as any)

    if (!userDoc) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const isValid = await verifyPassword(validatedData.password, userDoc.password)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = generateToken({
      userId: String(userDoc._id),
      email: userDoc.email
    })

    // Remove password from response
    const { password, ...userWithoutPassword } = { ...userDoc, id: String(userDoc._id) }

    return NextResponse.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    })

  } catch (error) {
    console.error('Login error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 