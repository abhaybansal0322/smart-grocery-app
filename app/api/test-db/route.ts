import { NextResponse } from 'next/server'
import { getCollection } from '@/lib/db'

export async function GET() {
  try {
    // Test database connection
    const Users = await getCollection('User')
    const Products = await getCollection('Product')
    const userCount = await Users.countDocuments({} as any)
    const productCount = await Products.countDocuments({} as any)
    
    // Check if test user exists
    const testUser = await Users.findOne({ email: 'test@smartgrocer.com' } as any, { projection: { _id: 1, firstName: 1, lastName: 1, email: 1 } } as any)

    return NextResponse.json({
      message: 'Database connection successful',
      userCount,
      productCount,
      testUser: testUser ? {
        id: String(testUser._id),
        name: `${testUser.firstName} ${testUser.lastName}`,
        email: testUser.email
      } : null
    })
  } catch (error) {
    console.error('Database test error:', error)
    
    // Handle error safely with proper type checking
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return NextResponse.json(
      { error: 'Database connection failed', details: errorMessage },
      { status: 500 }
    )
  }
} 