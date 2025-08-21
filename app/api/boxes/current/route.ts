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

    // Get or create the user's current box from database
    const Boxes = await getCollection('Box');
    let userBox = await Boxes.findOne({ userId: decoded.userId } as any);

    if (!userBox) {
      // Create a new empty box for the user
      const doc = {
        userId: decoded.userId,
        items: [],
        total: 0,
        deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'customizing',
        aiGenerated: true,
        createdAt: new Date(),
        updatedAt: new Date()
      } as any
      await Boxes.insertOne(doc)
      userBox = doc
    }

    // Convert the database box to the expected format
    const boxDoc: any = userBox as any
    const boxResponse = {
      items: (boxDoc?.items ?? []) as any[],
      total: boxDoc?.total ?? 0,
      deliveryDate: new Date(boxDoc?.deliveryDate).toISOString().split('T')[0],
      status: boxDoc?.status ?? 'customizing'
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
    const Boxes = await getCollection('Box');
    await Boxes.updateOne(
      { userId: decoded.userId } as any,
      { $set: {
          items: box.items,
          total: box.total,
          deliveryDate: new Date(box.deliveryDate),
          status: box.status,
          lastModified: new Date(),
          aiGenerated: true
        }
      },
      { upsert: true }
    );
    const updatedBox = await Boxes.findOne({ userId: decoded.userId } as any)
    const updatedBoxDoc: any = updatedBox as any

    console.log('Saving box to database for user:', decoded.userId);

    return NextResponse.json({ 
      message: 'Box saved successfully',
      box: {
        items: (updatedBoxDoc?.items ?? []),
        total: updatedBoxDoc?.total ?? 0,
        deliveryDate: new Date(updatedBoxDoc?.deliveryDate).toISOString().split('T')[0],
        status: updatedBoxDoc?.status ?? 'customizing'
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