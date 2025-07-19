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

    // For now, return mock data since we don't have orders in the database yet
    const mockOrders = [
      {
        id: 1,
        date: '2024-01-15',
        status: 'delivered',
        items: 24,
        total: 14200,
        rating: 5,
        itemsList: [
          { name: 'Organic Bananas', quantity: 2, price: 300 },
          { name: 'Fresh Spinach', quantity: 1, price: 450 },
          { name: 'Free-range Eggs', quantity: 1, price: 650 },
          { name: 'Whole Grain Bread', quantity: 1, price: 380 }
        ]
      },
      {
        id: 2,
        date: '2024-01-08',
        status: 'delivered',
        items: 22,
        total: 13800,
        rating: 4,
        itemsList: [
          { name: 'Avocados', quantity: 3, price: 450 },
          { name: 'Greek Yogurt', quantity: 2, price: 580 },
          { name: 'Sweet Potatoes', quantity: 2, price: 320 },
          { name: 'Almond Milk', quantity: 1, price: 420 }
        ]
      },
      {
        id: 3,
        date: '2024-01-01',
        status: 'delivered',
        items: 25,
        total: 15600,
        rating: 5,
        itemsList: [
          { name: 'Organic Chicken Breast', quantity: 1, price: 1200 },
          { name: 'Mixed Berries', quantity: 1, price: 680 },
          { name: 'Quinoa', quantity: 1, price: 450 },
          { name: 'Broccoli', quantity: 2, price: 380 }
        ]
      }
    ];

    return NextResponse.json({ 
      orders: mockOrders,
      message: 'Orders retrieved successfully' 
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 