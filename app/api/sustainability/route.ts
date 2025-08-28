import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getCollection } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('Sustainability API called');
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    // Public access allowed; if token provided, validate
    if (token) {
      const decoded = verifyToken(token);
      if (!decoded) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
    }

    const Products = await getCollection('Product');

    // Counts
    const [
      totalProducts,
      organicProducts,
      localProducts,
      seasonalProducts
    ] = await Promise.all([
      Products.countDocuments({ inStock: true } as any),
      Products.countDocuments({ inStock: true, isOrganic: true } as any),
      Products.countDocuments({ inStock: true, isLocal: true } as any),
      Products.countDocuments({ inStock: true, isSeasonal: true } as any)
    ]);

    // Average carbon footprint
    const avgAgg = await Products.aggregate([
      { $match: { inStock: true, carbonFootprint: { $ne: null } } },
      { $group: { _id: null, avg: { $avg: '$carbonFootprint' } } }
    ]).toArray();
    const avgCarbon = avgAgg[0]?.avg || 0;

    // Stats by category
    const statsAgg = await Products.aggregate([
      { $match: { inStock: true } },
      { $group: { _id: '$category', count: { $sum: 1 }, avgCarbonFootprint: { $avg: '$carbonFootprint' } } },
      { $project: { _id: 0, category: '$_id', count: 1, avgCarbonFootprint: 1 } }
    ]).toArray();

    // Top sustainable products
    const topSustainableProducts = await Products.find({ inStock: true, carbonFootprint: { $ne: null } } as any)
      .sort({ carbonFootprint: 1 })
      .limit(10)
      .project({ id: 1, name: 1, category: 1, carbonFootprint: 1, isOrganic: 1, isLocal: 1, imageUrl: 1, images: 1 } as any)
      .toArray();

    // Calculate percentages
    const organicPercentage = totalProducts > 0 ? (organicProducts / totalProducts) * 100 : 0;
    const localPercentage = totalProducts > 0 ? (localProducts / totalProducts) * 100 : 0;
    const seasonalPercentage = totalProducts > 0 ? (seasonalProducts / totalProducts) * 100 : 0;

    const sustainabilityData = {
      overview: {
        totalProducts,
        organicProducts,
        localProducts,
        seasonalProducts,
        organicPercentage: Math.round(organicPercentage * 100) / 100,
        localPercentage: Math.round(localPercentage * 100) / 100,
        seasonalPercentage: Math.round(seasonalPercentage * 100) / 100,
        averageCarbonFootprint: avgCarbon
      },
      byCategory: statsAgg.map((stat: any) => ({
        category: stat.category,
        count: stat.count,
        avgCarbonFootprint: stat.avgCarbonFootprint || 0
      })),
      topSustainable: topSustainableProducts.map((product: any) => ({
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
