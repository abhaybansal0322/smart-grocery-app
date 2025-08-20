import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('Featured Products API called');
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '8');
    const category = searchParams.get('category');

    // Build where clause
    const where: any = {
      inStock: true
    };

    if (category) {
      where.category = category;
    }

    // Fetch featured products (organic, local, or seasonal items first)
    const featuredProducts = await prisma.product.findMany({
      where,
      take: limit,
      orderBy: [
        { isOrganic: 'desc' },
        { isLocal: 'desc' },
        { isSeasonal: 'desc' },
        { stockLevel: 'desc' }
      ],
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        subcategory: true,
        price: true,
        unit: true,
        isOrganic: true,
        isLocal: true,
        isSeasonal: true,
        imageUrl: true,
        brand: true,
        stockLevel: true,
        calories: true,
        protein: true,
        carbs: true,
        fat: true
      }
    });

    // Transform price from cents to dollars
    const transformedProducts = featuredProducts.map((product: any) => ({
      ...product,
      price: product.price / 100,
      unitPrice: product.price / 100
    }));

    console.log(`Featured Products API - Returning ${transformedProducts.length} products`);
    
    return NextResponse.json({ 
      products: transformedProducts,
      message: 'Featured products retrieved successfully' 
    });

  } catch (error) {
    console.error('Error fetching featured products:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage }, 
      { status: 500 }
    );
  }
}
