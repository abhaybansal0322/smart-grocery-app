import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('Products API called');
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    console.log('Products API - Token received:', token ? 'Yes' : 'No');
    
    if (!token) {
      console.log('Products API - No token provided');
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    console.log('Products API - Token decoded:', decoded ? 'Success' : 'Failed');
    
    if (!decoded) {
      console.log('Products API - Invalid token');
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const organic = searchParams.get('organic');
    const local = searchParams.get('local');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');

    // Build where clause for filtering
    const where: any = {
      inStock: true
    };

    if (category) {
      where.category = category;
    }

    if (organic === 'true') {
      where.isOrganic = true;
    }

    if (local === 'true') {
      where.isLocal = true;
    }

    if (minPrice) {
      where.price = { ...where.price, gte: parseInt(minPrice) * 100 }; // Convert to cents
    }

    if (maxPrice) {
      where.price = { ...where.price, lte: parseInt(maxPrice) * 100 }; // Convert to cents
    }

    // Fetch products from database with pagination
    const skip = (page - 1) * limit;
    
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
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
      }),
      prisma.product.count({ where })
    ]);

    console.log(`Products API - Returning ${products.length} products out of ${totalCount} total`);

    // Transform price from cents to dollars for frontend
    const transformedProducts = products.map((product: any) => ({
      ...product,
      price: product.price / 100, // Convert cents to dollars
      unitPrice: product.price / 100
    }));
    
    return NextResponse.json({ 
      products: transformedProducts,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      },
      message: 'Products retrieved successfully' 
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    
    // Handle error safely with proper type checking
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage }, 
      { status: 500 }
    );
  }
} 