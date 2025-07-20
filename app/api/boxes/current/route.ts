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

    // Get or create the user's current box from database
    let userBox = await prisma.box.findUnique({
      where: { userId: decoded.userId }
    });

    if (!userBox) {
      // Create a new box for the user with seeded items
      const defaultItems = [
        {
          id: 1,
          name: 'Organic Bananas',
          quantity: 2,
          price: 300,
          category: 'fruits',
          imageUrl: 'https://via.placeholder.com/64x64?text=Banana',
          organic: true
        },
        {
          id: 2,
          name: 'Fresh Spinach',
          quantity: 1,
          price: 450,
          category: 'vegetables',
          imageUrl: 'https://via.placeholder.com/64x64?text=Spinach',
          organic: true
        },
        {
          id: 3,
          name: 'Free-range Eggs',
          quantity: 1,
          price: 650,
          category: 'dairy',
          imageUrl: 'https://via.placeholder.com/64x64?text=Eggs',
          organic: false
        },
        {
          id: 4,
          name: 'Whole Grain Bread',
          quantity: 1,
          price: 380,
          category: 'bakery',
          imageUrl: 'https://via.placeholder.com/64x64?text=Bread',
          organic: false
        }
      ];

      userBox = await prisma.box.create({
        data: {
          userId: decoded.userId,
          items: defaultItems,
          total: 1780,
          deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          status: 'customizing',
          aiGenerated: true
        }
      });
    }

    // Convert the database box to the expected format
    const boxResponse = {
      items: userBox.items as any[],
      total: userBox.total,
      deliveryDate: userBox.deliveryDate.toISOString().split('T')[0],
      status: userBox.status
    };

    return NextResponse.json({ 
      box: boxResponse,
      message: 'Current box retrieved successfully' 
    });

  } catch (error) {
    console.error('Error fetching current box:', error);
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
    const { box } = body;

    // Update or create the user's box in the database
    const updatedBox = await prisma.box.upsert({
      where: { userId: decoded.userId },
      update: {
        items: box.items,
        total: box.total,
        deliveryDate: new Date(box.deliveryDate),
        status: box.status,
        lastModified: new Date()
      },
      create: {
        userId: decoded.userId,
        items: box.items,
        total: box.total,
        deliveryDate: new Date(box.deliveryDate),
        status: box.status,
        aiGenerated: true
      }
    });

    console.log('Saving box to database for user:', decoded.userId);

    return NextResponse.json({ 
      message: 'Box saved successfully',
      box: {
        items: updatedBox.items,
        total: updatedBox.total,
        deliveryDate: updatedBox.deliveryDate.toISOString().split('T')[0],
        status: updatedBox.status
      }
    });

  } catch (error) {
    console.error('Error saving box:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 