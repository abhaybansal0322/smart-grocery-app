import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('Products API called');
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    console.log('Products API - Token received:', token ? 'Yes' : 'No');
    
    if (!token) {
      console.log('Products API - No token provided');
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    console.log('Products API - Token decoded:', decoded ? 'Success' : 'Failed');
    
    if (!decoded) {
      console.log('Products API - Invalid token');
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Mock products data
    const mockProducts = [
      { id: 5, name: 'Avocados', price: 450, category: 'fruits', imageUrl: 'https://via.placeholder.com/64x64?text=Avocado', organic: true },
      { id: 6, name: 'Greek Yogurt', price: 580, category: 'dairy', imageUrl: 'https://via.placeholder.com/64x64?text=Yogurt', organic: false },
      { id: 7, name: 'Sweet Potatoes', price: 320, category: 'vegetables', imageUrl: 'https://via.placeholder.com/64x64?text=Potato', organic: true },
      { id: 8, name: 'Almond Milk', price: 420, category: 'dairy', imageUrl: 'https://via.placeholder.com/64x64?text=Milk', organic: true },
      { id: 9, name: 'Organic Chicken Breast', price: 1200, category: 'meat', imageUrl: 'https://via.placeholder.com/64x64?text=Chicken', organic: true },
      { id: 10, name: 'Mixed Berries', price: 680, category: 'fruits', imageUrl: 'https://via.placeholder.com/64x64?text=Berries', organic: true },
      { id: 11, name: 'Quinoa', price: 450, category: 'grains', imageUrl: 'https://via.placeholder.com/64x64?text=Quinoa', organic: false },
      { id: 12, name: 'Broccoli', price: 380, category: 'vegetables', imageUrl: 'https://via.placeholder.com/64x64?text=Broccoli', organic: true },
      { id: 13, name: 'Salmon Fillet', price: 1800, category: 'seafood', imageUrl: 'https://via.placeholder.com/64x64?text=Salmon', organic: false },
      { id: 14, name: 'Brown Rice', price: 280, category: 'grains', imageUrl: 'https://via.placeholder.com/64x64?text=Rice', organic: true },
      { id: 15, name: 'Bell Peppers', price: 350, category: 'vegetables', imageUrl: 'https://via.placeholder.com/64x64?text=Peppers', organic: true },
      { id: 16, name: 'Apples', price: 250, category: 'fruits', imageUrl: 'https://via.placeholder.com/64x64?text=Apples', organic: false }
    ];

    console.log('Products API - Returning', mockProducts.length, 'products');
    
    return NextResponse.json({ 
      products: mockProducts,
      message: 'Products retrieved successfully' 
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 