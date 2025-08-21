import { NextRequest, NextResponse } from 'next/server'
import { getCollection } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
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

    // Get user with profile
    const Users = await getCollection('User')
    const Profiles = await getCollection('UserProfile')
    const Subscriptions = await getCollection('Subscription')

    const userDoc = await Users.findOne<any>({ _id: (payload as any).userId } as any)
    const profile = await Profiles.findOne<any>({ userId: (payload as any).userId } as any)
    const subscription = await Subscriptions.findOne<any>({ userId: (payload as any).userId, status: 'active' } as any)

    const user = userDoc && {
      ...userDoc,
      profile,
      subscriptions: subscription ? [subscription] : []
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user as any

    return NextResponse.json({
      user: userWithoutPassword
    })

  } catch (error) {
    console.error('Get user profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 