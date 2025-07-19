import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Test database connection
    const userCount = await prisma.user.count()
    const productCount = await prisma.product.count()
    
    // Check if test user exists
    const testUser = await prisma.user.findUnique({
      where: { email: 'test@smartgrocer.com' },
      select: { id: true, firstName: true, lastName: true, email: true }
    })

    return NextResponse.json({
      message: 'Database connection successful',
      userCount,
      productCount,
      testUser: testUser ? {
        id: testUser.id,
        name: `${testUser.firstName} ${testUser.lastName}`,
        email: testUser.email
      } : null
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json(
      { error: 'Database connection failed', details: error.message },
      { status: 500 }
    )
  }
} 