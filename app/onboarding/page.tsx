'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronLeft, CheckCircle, Users, DollarSign, Heart, Utensils, Clock } from 'lucide-react';
import Link from 'next/link';

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    householdSize: 2,
    budget: [150],
    dietaryRestrictions: [] as string[],
    allergies: [] as string[],
    cookingTime: [30],
    mealTypes: [] as string[],
    shoppingFrequency: 'weekly',
    preferredDeliveryDay: 'saturday',
    sustainabilityImportance: [7]
  });

  const steps = [
    {
      title: 'Account Setup',
      description: 'Create your account',
      icon: Users,
      component: AccountStep
    },
    {
      title: 'Household Information',
      description: 'Tell us about your household',
      icon: Users,
      component: HouseholdStep
    },
    {
      title: 'Budget & Preferences',
      description: 'Set your budget and shopping preferences',
      icon: DollarSign,
      component: BudgetStep
    },
    {
      title: 'Dietary Requirements',
      description: 'Let us know about dietary restrictions and allergies',
      icon: Heart,
      component: DietaryStep
    },
    {
      title: 'Cooking Habits',
      description: 'How do you like to cook and eat?',
      icon: Utensils,
      component: CookingStep
    },
    {
      title: 'Schedule & Sustainability',
      description: 'Final preferences for delivery and sustainability',
      icon: Clock,
      component: ScheduleStep
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleSubmit = async () => {
    try {
      // First, register the user
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          householdSize: formData.householdSize,
          weeklyBudget: formData.budget[0],
          dietaryRestrictions: formData.dietaryRestrictions,
          allergies: formData.allergies,
          cookingTime: formData.cookingTime[0],
          mealTypes: formData.mealTypes,
          shoppingFrequency: formData.shoppingFrequency,
          preferredDeliveryDay: formData.preferredDeliveryDay,
          deliveryMethod: 'delivery',
          sustainabilityImportance: formData.sustainabilityImportance[0]
        }),
      });

      if (registerResponse.ok) {
        const registerData = await registerResponse.json();
        
        // Login to get the token
        const loginResponse = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        if (loginResponse.ok) {
          const loginData = await loginResponse.json();
          
          // Create a subscription
          const subscriptionResponse = await fetch('/api/subscriptions/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${loginData.token}`,
            },
            body: JSON.stringify({
              type: 'full',
              frequency: formData.shoppingFrequency,
              maxItems: 25,
              maxBudget: formData.budget[0] * 100, // Convert to cents
              aiEnabled: true,
              customizationLevel: 'moderate'
            }),
          });

          if (subscriptionResponse.ok) {
            // Store the token and redirect
            localStorage.setItem('authToken', loginData.token);
            window.location.href = '/dashboard';
          } else {
            console.error('Subscription creation failed');
            // Still redirect to dashboard even if subscription creation fails
            localStorage.setItem('authToken', loginData.token);
            window.location.href = '/dashboard';
          }
        } else {
          alert('Login failed after registration. Please try signing in manually.');
          window.location.href = '/signin';
        }
      } else {
        const error = await registerResponse.json();
        alert('Registration failed: ' + error.error);
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    }
  };

  function AccountStep() {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-base font-medium">First Name</Label>
            <Input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              placeholder="Enter your first name"
              className="mt-2"
            />
          </div>
          <div>
            <Label className="text-base font-medium">Last Name</Label>
            <Input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              placeholder="Enter your last name"
              className="mt-2"
            />
          </div>
        </div>
        <div>
          <Label className="text-base font-medium">Email Address</Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="Enter your email address"
            className="mt-2"
          />
        </div>
        <div>
          <Label className="text-base font-medium">Password</Label>
          <Input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            placeholder="Create a password"
            className="mt-2"
          />
          <p className="text-sm text-gray-600 mt-1">Must be at least 8 characters long</p>
        </div>
      </div>
    );
  }

  function HouseholdStep() {
    return (
      <div className="space-y-6">
        <div>
          <Label className="text-base font-medium">Household Size</Label>
          <p className="text-sm text-gray-600 mb-4">How many people will you be shopping for?</p>
          <div className="px-3">
            <Slider
              value={[formData.householdSize]}
              onValueChange={(value) => setFormData({...formData, householdSize: value[0]})}
              min={1}
              max={8}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>1 person</span>
              <span className="font-medium text-green-600">{formData.householdSize} people</span>
              <span>8+ people</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function BudgetStep() {
    return (
      <div className="space-y-6">
        <div>
          <Label className="text-base font-medium">Weekly Budget</Label>
          <p className="text-sm text-gray-600 mb-4">What&apos;s your typical weekly grocery budget?</p>
          <div className="px-3">
            <Slider
              value={formData.budget}
              onValueChange={(value) => setFormData({...formData, budget: value})}
              min={50}
              max={500}
              step={25}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>$50</span>
              <span className="font-medium text-green-600">${formData.budget[0]}/week</span>
              <span>$500+</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function DietaryStep() {
    const dietaryOptions = [
      'Vegetarian', 'Vegan', 'Gluten-Free', 'Keto', 'Paleo', 'Low-Carb', 'Dairy-Free', 'Organic Only'
    ];
    
    const allergyOptions = [
      'Nuts', 'Shellfish', 'Eggs', 'Dairy', 'Soy', 'Fish', 'Wheat', 'Seeds'
    ];

    return (
      <div className="space-y-6">
        <div>
          <Label className="text-base font-medium">Dietary Restrictions</Label>
          <p className="text-sm text-gray-600 mb-4">Select any dietary preferences that apply</p>
          <div className="grid grid-cols-2 gap-3">
            {dietaryOptions.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox 
                  id={option}
                  checked={formData.dietaryRestrictions.includes(option)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFormData({
                        ...formData, 
                        dietaryRestrictions: [...formData.dietaryRestrictions, option]
                      });
                    } else {
                      setFormData({
                        ...formData,
                        dietaryRestrictions: formData.dietaryRestrictions.filter(item => item !== option)
                      });
                    }
                  }}
                />
                <Label htmlFor={option} className="text-sm">{option}</Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-base font-medium">Allergies</Label>
          <p className="text-sm text-gray-600 mb-4">Let us know about any food allergies</p>
          <div className="grid grid-cols-2 gap-3">
            {allergyOptions.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox 
                  id={option}
                  checked={formData.allergies.includes(option)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFormData({
                        ...formData, 
                        allergies: [...formData.allergies, option]
                      });
                    } else {
                      setFormData({
                        ...formData,
                        allergies: formData.allergies.filter(item => item !== option)
                      });
                    }
                  }}
                />
                <Label htmlFor={option} className="text-sm">{option}</Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function CookingStep() {
    const mealOptions = [
      'Quick & Easy', 'Gourmet Cooking', 'Meal Prep', 'Family Meals', 'Healthy Options', 'International Cuisine'
    ];

    return (
      <div className="space-y-6">
        <div>
          <Label className="text-base font-medium">Cooking Time</Label>
          <p className="text-sm text-gray-600 mb-4">How much time do you typically spend cooking per meal?</p>
          <div className="px-3">
            <Slider
              value={formData.cookingTime}
              onValueChange={(value) => setFormData({...formData, cookingTime: value})}
              min={15}
              max={120}
              step={15}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>15 min</span>
              <span className="font-medium text-green-600">{formData.cookingTime[0]} minutes</span>
              <span>2+ hours</span>
            </div>
          </div>
        </div>

        <div>
          <Label className="text-base font-medium">Meal Preferences</Label>
          <p className="text-sm text-gray-600 mb-4">What types of meals interest you?</p>
          <div className="grid grid-cols-2 gap-3">
            {mealOptions.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox 
                  id={option}
                  checked={formData.mealTypes.includes(option)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFormData({
                        ...formData, 
                        mealTypes: [...formData.mealTypes, option]
                      });
                    } else {
                      setFormData({
                        ...formData,
                        mealTypes: formData.mealTypes.filter(item => item !== option)
                      });
                    }
                  }}
                />
                <Label htmlFor={option} className="text-sm">{option}</Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function ScheduleStep() {
    return (
      <div className="space-y-6">
        <div>
          <Label className="text-base font-medium">Delivery Preference</Label>
          <p className="text-sm text-gray-600 mb-4">When would you like to receive your groceries?</p>
          <div className="grid grid-cols-2 gap-3">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
              <Button
                key={day}
                variant={formData.preferredDeliveryDay === day.toLowerCase() ? "default" : "outline"}
                onClick={() => setFormData({...formData, preferredDeliveryDay: day.toLowerCase()})}
                className="justify-start"
              >
                {day}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-base font-medium">Sustainability Importance</Label>
          <p className="text-sm text-gray-600 mb-4">How important is sustainability to you?</p>
          <div className="px-3">
            <Slider
              value={formData.sustainabilityImportance}
              onValueChange={(value) => setFormData({...formData, sustainabilityImportance: value})}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>Not important</span>
              <span className="font-medium text-green-600">{formData.sustainabilityImportance[0]}/10</span>
              <span>Very important</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === steps.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center p-8">
          <div className="mb-6">
            <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">All Set!</h2>
            <p className="text-gray-600">
              Your personalized grocery experience is ready. Our AI will start learning your preferences right away.
            </p>
          </div>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span>Household Size:</span>
              <span className="font-medium">{formData.householdSize} people</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Weekly Budget:</span>
              <span className="font-medium">${formData.budget[0]}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Dietary Restrictions:</span>
              <span className="font-medium">{formData.dietaryRestrictions.length || 'None'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Delivery Day:</span>
              <span className="font-medium capitalize">{formData.preferredDeliveryDay}</span>
            </div>
          </div>
          <Button 
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white"
          >
            Complete Setup & Go to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  // Only assign CurrentStepComponent if currentStep < steps.length
  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      <div className="max-w-4xl mx-auto p-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="text-green-600 hover:text-green-700 text-sm font-medium">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-2">Let&apos;s Personalize Your Experience</h1>
          <p className="text-gray-600">Help us understand your needs so we can provide the best recommendations</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between mb-8">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                index <= currentStep 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {index < currentStep ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <step.icon className="h-5 w-5" />
                )}
              </div>
              <span className="text-xs text-gray-500 mt-1 text-center max-w-16">
                {step.title.split(' ')[0]}
              </span>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <Card className="p-8">
          <CardHeader className="text-center pb-6">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              {React.createElement(steps[currentStep].icon, { className: "h-8 w-8 text-green-600" })}
            </div>
            <CardTitle className="text-2xl">{steps[currentStep].title}</CardTitle>
            <CardDescription className="text-base">{steps[currentStep].description}</CardDescription>
          </CardHeader>
          <CardContent>
            <CurrentStepComponent />
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center space-x-2"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </Button>
          <Button
            onClick={currentStep === steps.length - 1 ? () => setCurrentStep(steps.length) : nextStep}
            className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-blue-600 text-white"
          >
            <span>{currentStep === steps.length - 1 ? 'Complete Setup' : 'Next'}</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}