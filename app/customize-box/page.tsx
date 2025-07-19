'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useBox } from '@/lib/box-context';
import ProtectedRoute from '@/components/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  Plus, 
  Minus, 
  Search,
  ArrowLeft,
  Save,
  RefreshCw,
  Star,
  Clock,
  DollarSign,
  ShoppingCart,
  Heart,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';

export default function CustomizeBox() {
  const { user, token } = useAuth();
  const { currentBox, updateCurrentBox, addToBox, removeFromBox, isLoading: boxLoading } = useBox();

  const [availableProducts, setAvailableProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  console.log('CustomizeBox render - currentBox:', currentBox, 'boxLoading:', boxLoading, 'availableProducts:', availableProducts.length, 'isLoading:', isLoading);

  useEffect(() => {
    if (token) {
      fetchAvailableProducts();
    } else {
      // Fallback to mock products if no token (for development/testing)
      setAvailableProducts(getMockProducts());
      setIsLoading(false);
    }
  }, [token]);



  const fetchAvailableProducts = async () => {
    console.log('Fetching products with token:', token ? 'Available' : 'Not available');
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch('/api/products', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('Products API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Products API data:', data);
        setAvailableProducts(data.products || getMockProducts());
      } else {
        console.error('Products API error:', response.status, response.statusText);
        setAvailableProducts(getMockProducts());
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      if (error.name === 'AbortError') {
        console.log('Products request timed out, using mock products');
      }
      setAvailableProducts(getMockProducts());
    } finally {
      setIsLoading(false);
    }
  };

  const getMockCurrentBox = () => ({
    items: [
      { id: 1, name: 'Organic Bananas', quantity: 2, price: 300, category: 'fruits' },
      { id: 2, name: 'Fresh Spinach', quantity: 1, price: 450, category: 'vegetables' },
      { id: 3, name: 'Free-range Eggs', quantity: 1, price: 650, category: 'dairy' },
      { id: 4, name: 'Whole Grain Bread', quantity: 1, price: 380, category: 'bakery' }
    ],
    total: 1780,
    deliveryDate: '2024-01-20',
    status: 'customizing'
  });

  const getMockProducts = () => [
    { id: 5, name: 'Avocados', price: 450, category: 'fruits', imageUrl: 'https://via.placeholder.com/64x64?text=Avocado', organic: true },
    { id: 6, name: 'Greek Yogurt', price: 580, category: 'dairy', imageUrl: 'https://via.placeholder.com/64x64?text=Yogurt', organic: false },
    { id: 7, name: 'Sweet Potatoes', price: 320, category: 'vegetables', imageUrl: 'https://via.placeholder.com/64x64?text=Potato', organic: true },
    { id: 8, name: 'Almond Milk', price: 420, category: 'dairy', imageUrl: 'https://via.placeholder.com/64x64?text=Milk', organic: true },
    { id: 9, name: 'Organic Chicken Breast', price: 1200, category: 'meat', imageUrl: 'https://via.placeholder.com/64x64?text=Chicken', organic: true },
    { id: 10, name: 'Mixed Berries', price: 680, category: 'fruits', imageUrl: 'https://via.placeholder.com/64x64?text=Berries', organic: true },
    { id: 11, name: 'Quinoa', price: 450, category: 'grains', imageUrl: 'https://via.placeholder.com/64x64?text=Quinoa', organic: false },
    { id: 12, name: 'Broccoli', price: 380, category: 'vegetables', imageUrl: 'https://via.placeholder.com/64x64?text=Broccoli', organic: true }
  ];



  const saveBox = async () => {
    if (!currentBox) return;
    
    setIsSaving(true);
    try {
      // The box is already saved through the context
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
      
      // Show success message
      console.log('Box saved successfully!');
    } catch (error) {
      console.error('Failed to save box:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredProducts = availableProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { key: 'all', label: 'All Categories', icon: '🛒' },
    { key: 'fruits', label: 'Fruits', icon: '🍎' },
    { key: 'vegetables', label: 'Vegetables', icon: '🥬' },
    { key: 'dairy', label: 'Dairy', icon: '🥛' },
    { key: 'meat', label: 'Meat', icon: '🥩' },
    { key: 'bakery', label: 'Bakery', icon: '🍞' },
    { key: 'grains', label: 'Grains', icon: '🌾' }
  ];

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
                    Customize Box
                  </span>
                </div>
              </div>
              <Button 
                onClick={saveBox} 
                disabled={isSaving}
                className={isSaved ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                {isSaving ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : isSaved ? (
                  <CheckCircle className="h-4 w-4 mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isSaved ? 'Saved!' : 'Save Box'}
              </Button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto p-4 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Customize Your Next Box
            </h1>
            <p className="text-gray-600">
              Delivery scheduled for {currentBox ? new Date(currentBox.deliveryDate).toLocaleDateString() : 'Loading...'}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Current Box */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ShoppingCart className="h-5 w-5 text-green-600" />
                    <span>Your Box</span>
                  </CardTitle>
                  <CardDescription>
                    {currentBox ? `${currentBox.items.length} items • $${(currentBox.total / 100).toFixed(2)}` : 'Loading...'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {currentBox && currentBox.items.length > 0 ? (
                      currentBox.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <img 
                              src={item.imageUrl || 'https://via.placeholder.com/40x40?text=Product'} 
                              alt={item.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                            <div>
                              <p className="font-medium text-sm">{item.name}</p>
                              <p className="text-xs text-gray-600">${(item.price / 100).toFixed(2)} each</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeFromBox(item.id)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => addToBox(item)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p>Your box is empty</p>
                        <p className="text-sm">Add items from the catalog</p>
                      </div>
                    )}
                    
                    {currentBox && currentBox.items.length > 0 && (
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">Total:</span>
                          <span className="text-lg font-bold text-green-600">
                            ${(currentBox.total / 100).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Items: {currentBox.items.length}</span>
                          <span>Delivery: {new Date(currentBox.deliveryDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Product Catalog */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Product Catalog</CardTitle>
                      <CardDescription>Browse and add items to your box</CardDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={fetchAvailableProducts}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Loading...' : 'Refresh Products'}
                    </Button>
                  </div>
                  
                  {/* Search and Filters */}
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <Button
                          key={category.key}
                          variant={selectedCategory === category.key ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedCategory(category.key)}
                        >
                          <span className="mr-1">{category.icon}</span>
                          {category.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading products...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredProducts.map((product) => (
                        <div key={product.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start space-x-3">
                            <img 
                              src={product.imageUrl} 
                              alt={product.name}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-medium">{product.name}</h4>
                                  <p className="text-sm text-gray-600 capitalize">{product.category}</p>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <span className="text-lg font-bold text-green-600">
                                      ${(product.price / 100).toFixed(2)}
                                    </span>
                                    {product.organic && (
                                      <Badge variant="secondary" className="text-xs">
                                        Organic
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => addToBox(product)}
                                  className="ml-2"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {filteredProducts.length === 0 && !isLoading && (
                    <div className="text-center py-12 text-gray-500">
                      <Search className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>No products found</p>
                      <p className="text-sm">Try adjusting your search or filters</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 