'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useBox } from '@/lib/box-context';
import { useToast } from '@/hooks/use-toast';
import ProtectedRoute from '@/components/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ShoppingCart, 
  Calendar, 
  Leaf, 
  TrendingUp, 
  Package, 
  Star,
  Brain,
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Settings,
  Plus
} from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const { user, token, logout } = useAuth();
  const { currentBox, refreshBox, isLoading: boxLoading, addToBox } = useBox();
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);



  const [nextBox, setNextBox] = useState({
    date: 'This Saturday',
    status: 'confirmed',
    items: 24,
    estimated: '$142'
  });

  // Update nextBox when currentBox changes
  useEffect(() => {
    if (currentBox) {
      setNextBox({
        date: new Date(currentBox.deliveryDate).toLocaleDateString('en-US', { 
          weekday: 'long',
          month: 'short',
          day: 'numeric'
        }),
        status: currentBox.status,
        items: currentBox.items.length,
        estimated: `$${(currentBox.total / 100).toFixed(0)}`
      });
    }
  }, [currentBox]);

  // Refresh box data when page becomes visible (user returns from customize page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && token) {
        refreshBox();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [token, refreshBox]);

  const fetchRecommendations = useCallback(async () => {
    try {
      const response = await fetch('/api/recommendations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.products || data.recommendations || []);
        setSubscription(data.subscription);
      } else {
        setRecommendations([]);
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
      setRecommendations([]);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const fetchSubscription = useCallback(async () => {
    try {
      const response = await fetch('/api/subscriptions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.subscriptions.length > 0) {
          setSubscription(data.subscriptions[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    }
  }, [token]);

  // Fetch recommendations and subscription data
  useEffect(() => {
    if (token) {
      fetchRecommendations();
      fetchSubscription();
      refreshBox();
    }
  }, [token, refreshBox, fetchRecommendations, fetchSubscription]);

  const sustainabilityMetrics = {
    wasteReduction: 73,
    carbonSaved: 12.5,
    localSourcing: 68,
    packaging: 85
  };

  const recentBoxes = [
    { date: 'Dec 2', rating: 5, items: 22, spent: '$138' },
    { date: 'Nov 25', rating: 4, items: 25, spent: '$156' },
    { date: 'Nov 18', rating: 5, items: 20, spent: '$125' }
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-green-600 to-blue-600 p-2 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                SmartGrocer
              </span>
            </div>
            <nav className="hidden md:flex space-x-6">
              <Link href="/dashboard" className="text-green-600 font-medium">Dashboard</Link>
              <Link href="/my-boxes" className="text-gray-600 hover:text-green-600">My Boxes</Link>
              <Link href="/preferences" className="text-gray-600 hover:text-green-600">Preferences</Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={logout}>
                Logout
              </Button>
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.firstName?.charAt(0) || 'U'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName || 'User'}!
          </h1>
          <p className="text-gray-600">Your AI is getting smarter every week. Here&apos;s what&apos;s happening with your groceries.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Next Box</p>
                  <p className="text-2xl font-bold text-gray-900">{nextBox.date}</p>
                </div>
                <Package className="h-8 w-8 text-green-600" />
              </div>
              <Badge className="mt-2 bg-green-100 text-green-800">
                {nextBox.status}
              </Badge>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">AI Confidence</p>
                  <p className="text-2xl font-bold text-gray-900">92%</p>
                </div>
                <Brain className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-xs text-gray-500 mt-2">Learning your preferences</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Time Saved</p>
                  <p className="text-2xl font-bold text-gray-900">4.5h</p>
                </div>
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-xs text-gray-500 mt-2">This week</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg. Spending</p>
                  <p className="text-2xl font-bold text-gray-900">$140</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-xs text-gray-500 mt-2">Per week</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Next Box Preview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Package className="h-5 w-5 text-green-600" />
                      <span>Your Next Box</span>
                    </CardTitle>
                    <CardDescription>Arriving {nextBox.date} • {nextBox.items} items • ~{nextBox.estimated}</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Link href="/customize-box">
                      <Button variant="outline" size="sm">
                        Customize
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={refreshBox}
                      disabled={boxLoading}
                    >
                      {boxLoading ? 'Loading...' : 'Refresh'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {boxLoading ? (
                    <div className="col-span-3 text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                      <p className="text-gray-500">Loading your box...</p>
                    </div>
                  ) : currentBox && currentBox.items.length > 0 ? (
                    currentBox.items.slice(0, 3).map((item, index) => (
                      <div key={index} className="text-center">
                        <img 
                          src={item.imageUrl || 'https://via.placeholder.com/64x64?text=Product'} 
                          alt={item.name}
                          className="w-16 h-16 rounded-lg mx-auto mb-2 object-cover"
                        />
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-green-600">${(item.price / 100).toFixed(2)}</p>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-8">
                      <p className="text-gray-500">Your box is empty</p>
                      <p className="text-sm text-gray-400">Add items to get started</p>
                    </div>
                  )}
                </div>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <Brain className="h-4 w-4 inline mr-1" />
                    AI improved your box based on last week&apos;s feedback. Added more protein options!
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* AI Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  <span>AI Recommendations</span>
                </CardTitle>
                <CardDescription>Smart suggestions based on your preferences and history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendations && recommendations.length > 0 ? (
                    recommendations.map((rec, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <img 
                          src={rec.imageUrl || 'https://via.placeholder.com/48x48?text=Product'} 
                          alt={rec.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium">{rec.name}</h4>
                            <span className="text-lg font-semibold text-green-600">${(rec.price / 100).toFixed(2)}</span>
                          </div>
                          <p className="text-sm text-gray-600">{rec.reason}</p>
                          <div className="flex items-center mt-2">
                            <Progress value={rec.confidence} className="flex-1 h-2" />
                            <span className="text-xs text-gray-500 ml-2">{rec.confidence}% match</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            addToBox({ ...rec, id: rec.productId });
                            toast({
                              title: 'Added to Box',
                              description: `${rec.name} has been added to your next box.`,
                              variant: 'default',
                            });
                          }}
                        >
                          Add
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Loading recommendations...</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Boxes</CardTitle>
                <CardDescription>Your shopping history and ratings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentBoxes.map((box, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{box.date}</p>
                        <p className="text-sm text-gray-600">{box.items} items • {box.spent}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${i < box.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                        <Link href="/my-boxes">
                          <Button variant="ghost" size="sm">View</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Sustainability Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Leaf className="h-5 w-5 text-green-600" />
                  <span>Sustainability Score</span>
                </CardTitle>
                <CardDescription>Your environmental impact this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Waste Reduction</span>
                      <span>{sustainabilityMetrics.wasteReduction}%</span>
                    </div>
                    <Progress value={sustainabilityMetrics.wasteReduction} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Local Sourcing</span>
                      <span>{sustainabilityMetrics.localSourcing}%</span>
                    </div>
                    <Progress value={sustainabilityMetrics.localSourcing} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Eco Packaging</span>
                      <span>{sustainabilityMetrics.packaging}%</span>
                    </div>
                    <Progress value={sustainabilityMetrics.packaging} className="h-2" />
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm text-green-600 font-medium">
                      🌱 You&apos;ve saved {sustainabilityMetrics.carbonSaved} lbs of CO2 this month!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link href="/customize-box">
                    <Button className="w-full justify-start" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Items to Next Box
                    </Button>
                  </Link>
                  <Button className="w-full justify-start" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Change Delivery Date
                  </Button>
                  <Link href="/preferences">
                    <Button className="w-full justify-start" variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Update Preferences
                    </Button>
                  </Link>
                  <Link href="/onboarding">
                    <Button className="w-full justify-start" variant="outline">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Retake Preference Quiz
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Smart Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      💡 Try rating items after each box to improve AI recommendations
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      🌱 Switching to more local produce could boost your sustainability score
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}