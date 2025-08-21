import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getCollection } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const Profiles = await getCollection('UserProfile');
    const profile = await Profiles.findOne({ userId: decoded.userId } as any);

    const preferences = profile ? {
      dietary: {
        vegetarian: false,
        vegan: false,
        glutenFree: false,
        dairyFree: false,
        keto: false,
        paleo: false,
        lowCarb: false,
        mediterranean: false
      },
      allergies: Array.isArray(profile.allergies) ? profile.allergies : [],
      budget: {
        min: Math.round((profile.weeklyBudget ?? 15000) / 100) - 50,
        max: Math.round((profile.weeklyBudget ?? 15000) / 100) + 50
      },
      frequency: 'weekly',
      householdSize: profile.householdSize ?? 1,
      sustainability: {
        localSourcing: 70,
        organic: 60,
        packaging: 80
      },
      aiLearning: {
        enabled: true,
        feedbackFrequency: 'after_each_box',
        personalizationLevel: 85
      }
    } : {
      dietary: {
        vegetarian: false,
        vegan: false,
        glutenFree: false,
        dairyFree: false,
        keto: false,
        paleo: false,
        lowCarb: false,
        mediterranean: false
      },
      allergies: [],
      budget: { min: 50, max: 200 },
      frequency: 'weekly',
      householdSize: 1,
      sustainability: { localSourcing: 70, organic: 60, packaging: 80 },
      aiLearning: { enabled: true, feedbackFrequency: 'after_each_box', personalizationLevel: 85 }
    };

    return NextResponse.json({ 
      preferences,
      message: 'Preferences retrieved successfully' 
    });

  } catch (error) {
    console.error('Error fetching preferences:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { preferences } = body;
    const Profiles = await getCollection('UserProfile');

    // Persist subset of preferences into UserProfile
    const weeklyBudgetDollars = preferences?.budget?.max ?? 200;
    await Profiles.updateOne(
      { userId: decoded.userId } as any,
      { $set: {
          householdSize: preferences?.householdSize ?? 1,
          weeklyBudget: Math.round(weeklyBudgetDollars * 100),
          allergies: preferences?.allergies ?? [],
          dietaryRestrictions: preferences?.dietary ?? {},
          cookingTime: 30,
          mealTypes: ['Quick & Easy'],
          shoppingFrequency: preferences?.frequency ?? 'weekly',
          preferredDeliveryDay: 'saturday',
          deliveryMethod: 'delivery',
          sustainabilityImportance: 7
        }
      },
      { upsert: true }
    );

    return NextResponse.json({ 
      message: 'Preferences saved successfully',
      preferences
    });

  } catch (error) {
    console.error('Error saving preferences:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 