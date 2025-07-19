import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/db';

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

    // For now, return mock preferences
    const mockPreferences = {
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
      budget: {
        min: 50,
        max: 200
      },
      frequency: 'weekly',
      householdSize: 2,
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
    };

    return NextResponse.json({ 
      preferences: mockPreferences,
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

    // For now, just return success since we're using mock data
    // In a real implementation, you would save to the database
    console.log('Saving preferences:', preferences);

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