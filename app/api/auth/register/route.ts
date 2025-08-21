import { NextRequest, NextResponse } from 'next/server'
import { getCollection } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  householdSize: z.number().min(1).max(8),
  weeklyBudget: z.number().min(50).max(1000),
  dietaryRestrictions: z.array(z.string()),
  allergies: z.array(z.string()),
  cookingTime: z.number().min(15).max(120),
  mealTypes: z.array(z.string()),
  shoppingFrequency: z.enum(['weekly', 'bi-weekly', 'monthly']),
  preferredDeliveryDay: z.string(),
  deliveryMethod: z.enum(['delivery', 'pickup']),
  pickupLocation: z.string().optional(),
  sustainabilityImportance: z.number().min(1).max(10)
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // Check if user already exists
    const users = await getCollection('User')
    const profiles = await getCollection('UserProfile')
    const existingUser = await users.findOne({ email: validatedData.email } as any)

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password)

    // Create user and profile
    const now = new Date()
    const insertUserResult = await users.insertOne({
      email: validatedData.email,
      password: hashedPassword,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      createdAt: now,
      updatedAt: now
    } as any)

    const userId = insertUserResult.insertedId.toString()

    const profileDoc = {
      userId,
      householdSize: validatedData.householdSize,
      weeklyBudget: validatedData.weeklyBudget * 100, // cents
      dietaryRestrictions: validatedData.dietaryRestrictions,
      allergies: validatedData.allergies,
      cookingTime: validatedData.cookingTime,
      mealTypes: validatedData.mealTypes,
      shoppingFrequency: validatedData.shoppingFrequency,
      preferredDeliveryDay: validatedData.preferredDeliveryDay,
      deliveryMethod: validatedData.deliveryMethod,
      pickupLocation: validatedData.pickupLocation,
      sustainabilityImportance: validatedData.sustainabilityImportance,
      createdAt: now,
      updatedAt: now
    }
    await profiles.insertOne(profileDoc as any)

    const user = {
      id: userId,
      email: validatedData.email,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      createdAt: now,
      updatedAt: now,
      profile: profileDoc
    }

    return NextResponse.json({
      message: 'User created successfully',
      user
    }, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)
    
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