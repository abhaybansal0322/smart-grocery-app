import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('Sustainability API called');
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get sustainability statistics
    const [
      totalProducts,
      organicProducts,
      localProducts,
      seasonalProducts,
      avgCarbonFootprint,
      sustainabilityStats
    ] = await Promise.all([
      prisma.product.count({ where: { inStock: true } }),
      prisma.product.count({ where: { inStock: true, isOrganic: true } }),
      prisma.product.count({ where: { inStock: true, isLocal: true } }),
      prisma.product.count({ where: { inStock: true, isSeasonal: true } }),
      prisma.product.aggregate({
        where: { 
          inStock: true,
          carbonFootprint: { not: null }
        },
        _avg: { carbonFootprint: true }
      }),
      prisma.product.groupBy({
        by: ['category'],
        where: { inStock: true },
        _count: { id: true },
        _avg: { carbonFootprint: true }
      })
    ]);

    // Calculate percentages
    const organicPercentage = totalProducts > 0 ? (organicProducts / totalProducts) * 100 : 0;
    const localPercentage = totalProducts > 0 ? (localProducts / totalProducts) * 100 : 0;
    const seasonalPercentage = totalProducts > 0 ? (seasonalProducts / totalProducts) * 100 : 0;

    // Get top sustainable products
    const topSustainableProducts = await prisma.product.findMany({
      where: { 
        inStock: true,
        carbonFootprint: { not: null }
      },
      take: 10,
      orderBy: { carbonFootprint: 'asc' },
      select: {
        id: true,
        name: true,
        category: true,
        carbonFootprint: true,
        isOrganic: true,
        isLocal: true,
        imageUrl: true
      }
    });

    const sustainabilityData = {
      overview: {
        totalProducts,
        organicProducts,
        localProducts,
        seasonalProducts,
        organicPercentage: Math.round(organicPercentage * 100) / 100,
        localPercentage: Math.round(localPercentage * 100) / 100,
        seasonalPercentage: Math.round(seasonalPercentage * 100) / 100,
        averageCarbonFootprint: avgCarbonFootprint._avg.carbonFootprint || 0
      },
      byCategory: sustainabilityStats.map(stat => ({
        category: stat.category,
        count: stat._count.id,
        avgCarbonFootprint: stat._avg.carbonFootprint || 0
      })),
      topSustainable: topSustainableProducts.map(product => ({
        ...product,
        carbonFootprint: product.carbonFootprint || 0
      }))
    };

    console.log('Sustainability API - Data retrieved successfully');
    
    return NextResponse.json({ 
      data: sustainabilityData,
      message: 'Sustainability data retrieved successfully' 
    });

  } catch (error) {
    console.error('Error fetching sustainability data:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage }, 
      { status: 500 }
    );
  }
}
