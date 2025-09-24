import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getCollection } from '@/lib/db';
import { AIRecommendationEngine } from '@/lib/ai-recommendations';

const aiRecommendationEngine = new AIRecommendationEngine();

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    console.log('AI Recommendations API called');
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
    const userProfile = await Profiles.findOne(
      { userId } as any,
      { projection: { dietaryRestrictions: 1, allergies: 1, sustainabilityImportance: 1, weeklyBudget: 1 } } as any
    );

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
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

    // Add any category-specific filtering
    const filteredRecommendations = category
      ? recommendations.filter((product) => product.category === category)
      : recommendations;

    // Transform recommendations for response
    const transformedProducts = filteredRecommendations.map((product) => ({
      id: product.productId,
      name: product.name,
      category: product.category,
      price: product.price,
      confidence: product.confidence,
      reason: product.reason,
      imageUrl: product.imageUrl,
      images: product.images || [],
      recommendationScore: product.confidence / 100,
      aiRecommended: product.aiRecommended || false,
    }));

    console.log(
      `AI Recommendations API - Returning ${transformedProducts.length} products for user ${userId}`
    );

    return NextResponse.json({
      products: transformedProducts,
      userProfile: {
        dietaryRestrictions: userProfile.dietaryRestrictions || [],
        sustainabilityImportance: userProfile.sustainabilityImportance || 5,
        weeklyBudget: userProfile.weeklyBudget / 100,
      },
      message: 'AI-powered recommendations retrieved successfully',
    });
  } catch (error) {
    console.error('AI Recommendations API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}