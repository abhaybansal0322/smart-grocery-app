'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import ProtectedRoute from '@/components/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ShoppingCart, 
  Calendar, 
  Package, 
  Star,
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Eye,
  Download
} from 'lucide-react';
import Link from 'next/link';

export default function MyBoxes() {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mock data for demonstration
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

  const displayOrders = orders.length > 0 ? orders : mockOrders;

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
                <div className="flex items-center space-x-2">
                  <div className="bg-gradient-to-r from-green-600 to-blue-600 p-2 rounded-lg">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    My Boxes
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto p-4 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              My Grocery Boxes
            </h1>
            <p className="text-gray-600">Track your orders and view past deliveries</p>
          </div>

          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Orders</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading your orders...</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {displayOrders.map((order) => (
                    <Card key={order.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center space-x-2">
                              <Package className="h-5 w-5 text-green-600" />
                              <span>Box #{order.id}</span>
                            </CardTitle>
                            <CardDescription>
                              Delivered on {new Date(order.date).toLocaleDateString()} • {order.items} items
                            </CardDescription>
                          </div>
                          <div className="flex items-center space-x-4">
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-4 w-4 ${i < order.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium mb-3">Items in this box:</h4>
                            <div className="space-y-2">
                              {order.itemsList?.slice(0, 4).map((item, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                  <span>{item.name} x{item.quantity}</span>
                                  <span className="text-green-600">${(item.price / 100).toFixed(2)}</span>
                                </div>
                              ))}
                              {order.itemsList?.length > 4 && (
                                <p className="text-sm text-gray-500">+{order.itemsList.length - 4} more items</p>
                              )}
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                              <span className="font-medium">Total:</span>
                              <span className="text-lg font-bold text-green-600">${(order.total / 100).toFixed(2)}</span>
                            </div>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" className="flex-1">
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Button>
                              <Button size="sm" variant="outline">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="recent" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest deliveries and ratings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {displayOrders.slice(0, 3).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">Box #{order.id}</p>
                          <p className="text-sm text-gray-600">{new Date(order.date).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-4 w-4 ${i < order.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                          <Button variant="ghost" size="sm">View</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="favorites" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Favorite Items</CardTitle>
                  <CardDescription>Items you've rated highly</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['Organic Bananas', 'Fresh Spinach', 'Free-range Eggs', 'Avocados'].map((item, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Package className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item}</p>
                          <p className="text-sm text-gray-600">Rated 5 stars</p>
                        </div>
                        <Button size="sm" variant="outline">Add to Box</Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stats" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Package className="h-5 w-5 text-green-600" />
                      <span>Total Boxes</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-gray-900">{displayOrders.length}</p>
                    <p className="text-sm text-gray-600">Delivered so far</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      <span>Average Rating</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-gray-900">
                      {(displayOrders.reduce((acc, order) => acc + order.rating, 0) / displayOrders.length).toFixed(1)}
                    </p>
                    <p className="text-sm text-gray-600">Out of 5 stars</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <span>Total Spent</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-gray-900">
                      ${(displayOrders.reduce((acc, order) => acc + order.total, 0) / 100).toFixed(0)}
                    </p>
                    <p className="text-sm text-gray-600">On groceries</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
} 