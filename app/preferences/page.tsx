'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import ProtectedRoute from '@/components/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Heart, 
  AlertTriangle, 
  Brain,
  ArrowLeft,
  Save,
  RefreshCw,
  Leaf,
  Users,
  Clock,
  DollarSign,
  Package
} from 'lucide-react';
import Link from 'next/link';

export default function Preferences() {
  const { user, token } = useAuth();
  const [preferences, setPreferences] = useState({
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
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (token) {
      fetchPreferences();
    }
  }, [token]);

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/user/preferences', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPreferences(data.preferences || preferences);
      }
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
    }
  };

  const savePreferences = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ preferences })
      });
      
      if (response.ok) {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDietary = (diet) => {
    setPreferences(prev => ({
      ...prev,
      dietary: {
        ...prev.dietary,
        [diet]: !prev.dietary[diet]
      }
    }));
  };

  const updateBudget = (values) => {
    setPreferences(prev => ({
      ...prev,
      budget: {
        min: values[0],
        max: values[1]
      }
    }));
  };

  const updateSustainability = (type, value) => {
    setPreferences(prev => ({
      ...prev,
      sustainability: {
        ...prev.sustainability,
        [type]: value
      }
    }));
  };

  const updateAILearning = (setting, value) => {
    setPreferences(prev => ({
      ...prev,
      aiLearning: {
        ...prev.aiLearning,
        [setting]: value
      }
    }));
  };

  const dietaryOptions = [
    { key: 'vegetarian', label: 'Vegetarian', icon: '🥬' },
    { key: 'vegan', label: 'Vegan', icon: '🌱' },
    { key: 'glutenFree', label: 'Gluten-Free', icon: '🌾' },
    { key: 'dairyFree', label: 'Dairy-Free', icon: '🥛' },
    { key: 'keto', label: 'Keto', icon: '🥑' },
    { key: 'paleo', label: 'Paleo', icon: '🥩' },
    { key: 'lowCarb', label: 'Low-Carb', icon: '🍞' },
    { key: 'mediterranean', label: 'Mediterranean', icon: '🐟' }
  ];

  const allergyOptions = [
    'Peanuts', 'Tree Nuts', 'Milk', 'Eggs', 'Soy', 'Wheat', 'Fish', 'Shellfish'
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
                    <Settings className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    Preferences
                  </span>
                </div>
              </div>
              <Button 
                onClick={savePreferences} 
                disabled={isLoading}
                className={isSaved ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : isSaved ? (
                  <Save className="h-4 w-4 mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isSaved ? 'Saved!' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto p-4 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Your Preferences
            </h1>
            <p className="text-gray-600">Customize your AI recommendations and delivery preferences</p>
          </div>

          <Tabs defaultValue="dietary" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="dietary">Dietary</TabsTrigger>
              <TabsTrigger value="allergies">Allergies</TabsTrigger>
              <TabsTrigger value="delivery">Delivery</TabsTrigger>
              <TabsTrigger value="ai">AI Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="dietary" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    <span>Dietary Preferences</span>
                  </CardTitle>
                  <CardDescription>Select your dietary restrictions and preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dietaryOptions.map((option) => (
                      <div key={option.key} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{option.icon}</span>
                          <div>
                            <p className="font-medium">{option.label}</p>
                            <p className="text-sm text-gray-600">
                              {preferences.dietary[option.key] ? 'Enabled' : 'Disabled'}
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={preferences.dietary[option.key]}
                          onCheckedChange={() => toggleDietary(option.key)}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="allergies" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <span>Food Allergies & Intolerances</span>
                  </CardTitle>
                  <CardDescription>Select foods you need to avoid</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {allergyOptions.map((allergy) => (
                      <Button
                        key={allergy}
                        variant={preferences.allergies.includes(allergy) ? "default" : "outline"}
                        className="justify-start"
                        onClick={() => {
                          setPreferences(prev => ({
                            ...prev,
                            allergies: prev.allergies.includes(allergy)
                              ? prev.allergies.filter(a => a !== allergy)
                              : [...prev.allergies, allergy]
                          }));
                        }}
                      >
                        {allergy}
                      </Button>
                    ))}
                  </div>
                  {preferences.allergies.length > 0 && (
                    <div className="mt-4 p-4 bg-orange-50 rounded-lg">
                      <p className="text-sm text-orange-800">
                        <AlertTriangle className="h-4 w-4 inline mr-1" />
                        We&apos;ll never include these items in your boxes
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="delivery" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <span>Budget Range</span>
                    </CardTitle>
                    <CardDescription>Set your weekly grocery budget</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span>${preferences.budget.min}</span>
                        <span>${preferences.budget.max}</span>
                      </div>
                      <Slider
                        value={[preferences.budget.min, preferences.budget.max]}
                        onValueChange={updateBudget}
                        max={300}
                        min={25}
                        step={5}
                        className="w-full"
                      />
                      <p className="text-sm text-gray-600">
                        Your AI will aim to stay within this range
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      <span>Household Size</span>
                    </CardTitle>
                    <CardDescription>How many people are you shopping for?</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPreferences(prev => ({ ...prev, householdSize: Math.max(1, prev.householdSize - 1) }))}
                        >
                          -
                        </Button>
                        <span className="text-2xl font-bold px-4">{preferences.householdSize}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPreferences(prev => ({ ...prev, householdSize: prev.householdSize + 1 }))}
                        >
                          +
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600">
                        {preferences.householdSize === 1 ? 'Shopping for yourself' : 
                         `Shopping for ${preferences.householdSize} people`}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-purple-600" />
                      <span>Delivery Frequency</span>
                    </CardTitle>
                    <CardDescription>How often would you like deliveries?</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {['weekly', 'bi-weekly', 'monthly'].map((freq) => (
                        <Button
                          key={freq}
                          variant={preferences.frequency === freq ? "default" : "outline"}
                          className="w-full justify-start"
                          onClick={() => setPreferences(prev => ({ ...prev, frequency: freq }))}
                        >
                          {freq.charAt(0).toUpperCase() + freq.slice(1)} deliveries
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Leaf className="h-5 w-5 text-green-600" />
                      <span>Sustainability Preferences</span>
                    </CardTitle>
                    <CardDescription>Your environmental impact preferences</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Local Sourcing</span>
                          <span>{preferences.sustainability.localSourcing}%</span>
                        </div>
                        <Slider
                          value={[preferences.sustainability.localSourcing]}
                          onValueChange={(value) => updateSustainability('localSourcing', value[0])}
                          max={100}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Organic Products</span>
                          <span>{preferences.sustainability.organic}%</span>
                        </div>
                        <Slider
                          value={[preferences.sustainability.organic]}
                          onValueChange={(value) => updateSustainability('organic', value[0])}
                          max={100}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Eco Packaging</span>
                          <span>{preferences.sustainability.packaging}%</span>
                        </div>
                        <Slider
                          value={[preferences.sustainability.packaging]}
                          onValueChange={(value) => updateSustainability('packaging', value[0])}
                          max={100}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="ai" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="h-5 w-5 text-blue-600" />
                    <span>AI Learning Settings</span>
                  </CardTitle>
                  <CardDescription>Control how your AI learns from your preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Enable AI Learning</p>
                        <p className="text-sm text-gray-600">
                          Allow AI to learn from your ratings and feedback
                        </p>
                      </div>
                      <Switch
                        checked={preferences.aiLearning.enabled}
                        onCheckedChange={(checked) => updateAILearning('enabled', checked)}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Personalization Level: {preferences.aiLearning.personalizationLevel}%
                      </label>
                      <Slider
                        value={[preferences.aiLearning.personalizationLevel]}
                        onValueChange={(value) => updateAILearning('personalizationLevel', value[0])}
                        max={100}
                        className="w-full"
                      />
                      <p className="text-sm text-gray-600 mt-2">
                        Higher levels mean more personalized but less variety
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Feedback Frequency</label>
                      <div className="space-y-2">
                        {[
                          { value: 'after_each_box', label: 'After each box delivery' },
                          { value: 'weekly', label: 'Weekly reminders' },
                          { value: 'monthly', label: 'Monthly summary' }
                        ].map((option) => (
                          <Button
                            key={option.value}
                            variant={preferences.aiLearning.feedbackFrequency === option.value ? "default" : "outline"}
                            className="w-full justify-start"
                            onClick={() => updateAILearning('feedbackFrequency', option.value)}
                          >
                            {option.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>AI Insights</CardTitle>
                  <CardDescription>What your AI has learned about you</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">92%</p>
                      <p className="text-sm text-gray-600">Confidence Score</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">24</p>
                      <p className="text-sm text-gray-600">Items Rated</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">3</p>
                      <p className="text-sm text-gray-600">Boxes Analyzed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
} 