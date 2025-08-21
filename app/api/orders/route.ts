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

    const Orders = await getCollection('Order');
    const OrderItems = await getCollection('OrderItem');
    const Products = await getCollection('Product');

    const orders = await Orders.find({ userId: decoded.userId } as any)
      .sort({ deliveryDate: -1 })
      .toArray();

    const orderIds = orders.map((o: any) => o._id?.toString() || o.id);
    const items = await OrderItems.find({ orderId: { $in: orderIds } } as any).toArray();
    const productIds = Array.from(new Set(items.map((it: any) => it.productId)));
    const products = await Products.find({ id: { $in: productIds } } as any).toArray();
    const productMap = new Map(products.map((p: any) => [p.id, p]));

    const transformed = orders.map((order: any) => {
      const orderItemList = items.filter((it: any) => it.orderId === (order.id || order._id?.toString()))
      return {
        id: order.id || order._id?.toString(),
        date: new Date(order.deliveryDate).toISOString().split('T')[0],
        status: order.status,
        items: orderItemList.length,
        total: order.totalAmount,
        rating: 0,
        itemsList: orderItemList.map((it: any) => ({
          name: productMap.get(it.productId)?.name || '',
          quantity: it.quantity,
          price: it.unitPrice
        }))
      }
    });

    return NextResponse.json({ 
      orders: transformed,
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