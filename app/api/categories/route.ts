import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('Categories API called');
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get unique categories with product counts
    const categories = await prisma.product.groupBy({
      by: ['category'],
      where: { inStock: true },
      _count: {
        id: true
      }
    });

    // Get subcategories for each category
    const categoriesWithSubcategories = await Promise.all(
      categories.map(async (cat) => {
        const subcategories = await prisma.product.findMany({
          where: { 
            category: cat.category,
            inStock: true 
          },
          select: { subcategory: true },
          distinct: ['subcategory']
        });

        return {
          name: cat.category,
          count: cat._count.id,
          subcategories: subcategories
            .map(sub => sub.subcategory)
            .filter(Boolean)
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
