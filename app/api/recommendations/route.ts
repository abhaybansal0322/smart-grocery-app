import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getCollection } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('Recommendations API called');
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.userId;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');

    // Get user profile and preferences
    const Profiles = await getCollection('UserProfile');
    const userProfile = await Profiles.findOne({ userId } as any, { projection: { dietaryRestrictions: 1, allergies: 1, sustainabilityImportance: 1, weeklyBudget: 1 } } as any);

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Get user preferences
    const Preferences = await getCollection('UserPreference');
    const userPreferences = await Preferences.find({ userId } as any).sort({ preference: -1 }).limit(20).toArray();

    // Build recommendation query
    const where: any = {
      inStock: true
    };

    if (category) {
      where.category = category;
    }

    // Filter out products with user allergies
    if (userProfile.allergies && Array.isArray(userProfile.allergies)) {
      const allergies = userProfile.allergies as string[];
      if (allergies.length > 0) {
        // This is a simplified allergy filter - in production you'd want more sophisticated matching
        where.NOT = {
          OR: allergies.map(allergy => ({
            name: { contains: allergy, mode: 'insensitive' }
          }))
        };
      }
    }

    // Get recommended products based on preferences and sustainability
    const Products = await getCollection('Product');
    const mongoFilter: any = { inStock: true };
    if (where.category) mongoFilter.category = where.category;
    const recommendedProducts = await Products.find(mongoFilter)
      .sort({ isOrganic: -1, isLocal: -1, isSeasonal: -1, stockLevel: -1 })
      .limit(limit)
      .toArray();

    // Transform and score products
    const scoredProducts = recommendedProducts.map((product: any) => {
      let score = 0;
      
      // Base score from user preferences
      const preference = userPreferences.find(p => 
        p.category === product.category || 
        p.itemName.toLowerCase().includes(product.name.toLowerCase())
      );
      
      if (preference) {
        score += preference.preference * 10;
      }

      // Sustainability bonus
      if (product.isOrganic) score += 2;
      if (product.isLocal) score += 2;
      if (product.isSeasonal) score += 1;
      
      // Carbon footprint bonus (lower is better)
      if (product.carbonFootprint && product.carbonFootprint < 1) score += 3;
      else if (product.carbonFootprint && product.carbonFootprint < 2) score += 2;

      // Budget consideration
      const priceInDollars = product.price / 100;
      const weeklyBudget = userProfile.weeklyBudget / 100;
      if (priceInDollars <= weeklyBudget * 0.1) score += 1; // Good price relative to budget

      return {
        ...product,
        price: priceInDollars,
        unitPrice: priceInDollars,
        recommendationScore: score,
        carbonFootprint: product.carbonFootprint || 0,
        images: Array.isArray((product as any).images) ? (product as any).images : []
      };
    });

    // Sort by recommendation score
    scoredProducts.sort((a, b) => b.recommendationScore - a.recommendationScore);

    console.log(`Recommendations API - Returning ${scoredProducts.length} products for user ${userId}`);
    
    return NextResponse.json({ 
      products: scoredProducts,
      userProfile: {
        dietaryRestrictions: userProfile.dietaryRestrictions,
        sustainabilityImportance: userProfile.sustainabilityImportance,
        weeklyBudget: userProfile.weeklyBudget / 100
      },
      message: 'Recommendations retrieved successfully' 
    });

  } catch (error) {
    console.error('Error fetching recommendations:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage }, 
      { status: 500 }
    );
  }
} 