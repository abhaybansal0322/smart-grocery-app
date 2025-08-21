import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getCollection } from '@/lib/db';

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
    const Products = await getCollection('Product');
    const mongoFilter: any = { inStock: true };
    if (where.category) mongoFilter.category = where.category;
    const featuredProducts = await Products.find(mongoFilter)
      .sort({ isOrganic: -1, isLocal: -1, isSeasonal: -1, stockLevel: -1 })
      .limit(limit)
      .toArray();

    // Transform price from cents to dollars
    const transformedProducts = featuredProducts.map((product: any) => ({
      ...product,
      price: product.price / 100,
      unitPrice: product.price / 100,
      images: Array.isArray(product.images) ? product.images : []
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
