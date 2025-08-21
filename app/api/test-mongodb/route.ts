import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';

export async function GET() {
  try {
    console.log('Testing MongoDB connection...');
    
    // Test basic connection by trying to count products
    const Products = await getCollection('Product');
    const productCount = await Products.countDocuments({} as any);
    
    console.log('MongoDB connection successful!');
    
    return NextResponse.json({
      message: 'MongoDB connection successful!',
      productCount,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        error: 'MongoDB connection failed', 
        details: errorMessage,
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
}
