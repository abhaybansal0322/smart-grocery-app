import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { z } from 'zod'

const createSubscriptionSchema = z.object({
  type: z.enum(['full', 'fruits', 'vegetables', 'proteins', 'snacks', 'household']).default('full'),
  frequency: z.enum(['weekly', 'bi-weekly', 'monthly']).default('weekly'),
  maxItems: z.number().min(5).max(50).default(25),
  maxBudget: z.number().min(5000).max(100000).default(15000), // in cents
  aiEnabled: z.boolean().default(true),
  customizationLevel: z.enum(['minimal', 'moderate', 'full']).default('moderate')
})

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)
    
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createSubscriptionSchema.parse(body)

    // Calculate next delivery date based on frequency
    const nextDelivery = calculateNextDelivery(validatedData.frequency)

    // Create subscription
    const subscription = await prisma.subscription.create({
      data: {
        userId: payload.userId,
        name: `My ${validatedData.type.charAt(0).toUpperCase() + validatedData.type.slice(1)} Box`,
        type: validatedData.type,
        frequency: validatedData.frequency,
        nextDelivery,
        maxItems: validatedData.maxItems,
        maxBudget: validatedData.maxBudget,
        aiEnabled: validatedData.aiEnabled,
        customizationLevel: validatedData.customizationLevel
      }
    })

    return NextResponse.json({
      message: 'Subscription created successfully',
      subscription
    }, { status: 201 })

  } catch (error) {
    console.error('Create subscription error:', error)
    
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

function calculateNextDelivery(frequency: string): Date {
  const now = new Date()
  
  switch (frequency) {
    case 'weekly':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    case 'bi-weekly':
      return new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
    case 'monthly':
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    default:
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  }
} 