import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getCollection } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('Categories API called');
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    // Allow public access; validate only if token is provided
    if (token) {
      const decoded = verifyToken(token);
      if (!decoded) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
    }

    const Products = await getCollection('Product');
    const agg = await Products.aggregate([
      { $match: { inStock: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { _id: 0, category: '$_id', count: 1 } }
    ]).toArray();

    // Get subcategories for each category
    const categoriesWithSubcategories = await Promise.all(
      agg.map(async (cat) => {
        const subs = await Products.distinct('subcategory', { category: cat.category, inStock: true } as any);
        return {
          name: cat.category as string,
          count: cat.count as number,
          subcategories: (subs as any[]).filter(Boolean)
        };
      })
    );

    console.log(`Categories API - Returning ${categoriesWithSubcategories.length} categories`);
    
    return NextResponse.json({ 
      categories: categoriesWithSubcategories,
      message: 'Categories retrieved successfully' 
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage }, 
      { status: 500 }
    );
  }
}
