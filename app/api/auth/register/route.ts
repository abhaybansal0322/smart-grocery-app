import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

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
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password)

    // Create user and profile in a transaction
    const user = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const newUser = await tx.user.create({
        data: {
          email: validatedData.email,
          password: hashedPassword,
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          profile: {
            create: {
              householdSize: validatedData.householdSize,
              weeklyBudget: validatedData.weeklyBudget * 100, // Convert to cents
              dietaryRestrictions: validatedData.dietaryRestrictions,
              allergies: validatedData.allergies,
              cookingTime: validatedData.cookingTime,
              mealTypes: validatedData.mealTypes,
              shoppingFrequency: validatedData.shoppingFrequency,
              preferredDeliveryDay: validatedData.preferredDeliveryDay,
              deliveryMethod: validatedData.deliveryMethod,
              pickupLocation: validatedData.pickupLocation,
              sustainabilityImportance: validatedData.sustainabilityImportance
            }
          }
        },
        include: {
          profile: true
        }
      })

      return newUser
    })

    // Remove password from response
    const { password, ...userWithoutPassword } = user

    return NextResponse.json({
      message: 'User created successfully',
      user: userWithoutPassword
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