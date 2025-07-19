import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { aiEngine } from '@/lib/ai-recommendations'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
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

    // Get user profile
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: payload.userId }
    })

    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Get active subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: payload.userId,
        status: 'active'
      }
    })

    if (!subscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      )
    }

    // Generate recommendations
    const recommendations = await aiEngine.generateRecommendations({
      userId: payload.userId,
      budget: subscription.maxBudget,
      maxItems: subscription.maxItems,
      dietaryRestrictions: userProfile.dietaryRestrictions,
      allergies: userProfile.allergies,
      sustainabilityImportance: userProfile.sustainabilityImportance
    })

    return NextResponse.json({
      recommendations,
      subscription: {
        id: subscription.id,
        type: subscription.type,
        maxItems: subscription.maxItems,
        maxBudget: subscription.maxBudget,
        nextDelivery: subscription.nextDelivery
      }
    })

  } catch (error) {
    console.error('Recommendations error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 