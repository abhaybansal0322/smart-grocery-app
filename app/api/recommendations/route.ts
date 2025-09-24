import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getCollection } from '@/lib/db';
import { AIRecommendationEngine } from '@/lib/ai-recommendations';

const aiRecommendationEngine = new AIRecommendationEngine();

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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

    // Get AI-powered recommendations
    const recommendations = await aiRecommendationEngine.generateRecommendations({
      userId,
      budget: userProfile.weeklyBudget,
      maxItems: limit,
      dietaryRestrictions: userProfile.dietaryRestrictions || [],
      allergies: userProfile.allergies || [],
      sustainabilityImportance: userProfile.sustainabilityImportance || 5,
    });

    // Transform recommendations for response
    const transformedProducts = recommendations.map((product) => {
      const { confidence, ...rest } = product;
      return {
        ...rest,
        confidence,
        recommendationScore: confidence / 100,
        carbonFootprint: 0, // Default to 0 since we don't have this data yet
        images: Array.isArray((product as any).images) ? (product as any).images : []
      };
    });

    // Sort by recommendation score
    transformedProducts.sort((a, b) => b.recommendationScore - a.recommendationScore);

    console.log(`Recommendations API - Returning ${transformedProducts.length} products for user ${userId}`);
    
    return NextResponse.json({ 
      products: transformedProducts,
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