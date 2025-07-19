'use client';

import React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ShoppingCart, Brain, Truck, Leaf, Clock, Users, Star } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: Brain,
      title: 'AI-Driven Preferences',
      description: 'Smart system learns your food habits and dietary needs over time',
      details: 'Input dietary needs, preferences (vegan, gluten-free), and budget. Our AI refines suggestions based on your purchase history and consumption patterns.'
    },
    {
      icon: Clock,
      title: 'Weekly Customization',
      description: 'Automatically generated shopping lists based on your lifestyle',
      details: 'Save time with AI-generated lists featuring seasonal ingredients, recipe suggestions, and personalized recommendations.'
    },
    {
      icon: ShoppingCart,
      title: 'Subscription Flexibility',
      description: 'Choose between full grocery boxes or specialized options',
      details: 'Full grocery box, fruit box, healthy snack box, and more. Adjust frequency and update preferences anytime.'
    },
    {
      icon: Truck,
      title: 'Delivery & Pickup',
      description: 'Convenient delivery to your door or local store pickup',
      details: 'Integrated with local stores to ensure fresh, local produce when available. Choose what works for your schedule.'
    },
    {
      icon: Leaf,
      title: 'Sustainability Focus',
      description: 'Reduce food waste with smart consumption tracking',
      details: 'Only get what you need based on consumption patterns. Eco-friendly packaging and sustainable brand partnerships.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Working Mom',
      content: 'This service has been a game-changer for our family. No more last-minute grocery runs!',
      rating: 5
    },
    {
      name: 'Mike Chen',
      role: 'Fitness Enthusiast',
      content: 'The AI perfectly understands my dietary needs. My nutrition goals have never been easier to maintain.',
      rating: 5
    },
    {
      name: 'Emma Davis',
      role: 'Environmental Advocate',
      content: 'I love how this reduces food waste. The sustainability tracking motivates me to be more conscious.',
      rating: 5
    }
  ];

  return (
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
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-green-600 transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-green-600 transition-colors">How It Works</a>
              <a href="#sustainability" className="text-gray-600 hover:text-green-600 transition-colors">Sustainability</a>
            </nav>
            <div className="flex items-center space-x-4">
              <Link href="/signin">
                <Button variant="ghost" className="text-gray-600">Sign In</Button>
              </Link>
              <Link href="/onboarding">
                <Button className="bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <Badge className="mb-4 bg-green-100 text-green-800 border-green-200">
              AI-Powered Grocery Solution
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Smart Grocery Shopping,{' '}
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Simplified
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Say goodbye to crowded stores and meal planning stress. Our AI-driven subscription service 
              learns your preferences and delivers personalized grocery boxes that fit your lifestyle.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/onboarding">
                <Button size="lg" className="bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700">
                  Start Your Smart Journey
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">The Problem We Solve</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Busy families and individuals struggle with time-consuming grocery shopping, meal planning, 
              and navigating crowded stores while trying to maintain healthy eating habits.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <Clock className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Time Constraints</h3>
              <p className="text-gray-600">Average family spends 2+ hours weekly on grocery shopping and meal planning</p>
            </Card>
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <Users className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Crowded Stores</h3>
              <p className="text-gray-600">Stressful shopping experiences in busy supermarkets with long checkout lines</p>
            </Card>
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <Leaf className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Food Waste</h3>
              <p className="text-gray-600">40% of food purchased goes to waste due to poor planning and impulse buying</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Intelligent Features</h2>
            <p className="text-lg text-gray-600">
              Our AI-powered platform adapts to your lifestyle and preferences
            </p>
          </div>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              {features.map((feature, index) => (
                <Card 
                  key={index}
                  className={`p-6 cursor-pointer transition-all duration-300 ${
                    activeFeature === index 
                      ? 'border-green-500 shadow-lg bg-green-50' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setActiveFeature(index)}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-lg ${
                      activeFeature === index ? 'bg-green-600' : 'bg-gray-200'
                    }`}>
                      <feature.icon className={`h-6 w-6 ${
                        activeFeature === index ? 'text-white' : 'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="flex items-center mb-4">
                {React.createElement(features[activeFeature].icon, { className: "h-8 w-8 text-green-600 mr-3" })}
                <h3 className="text-2xl font-bold">{features[activeFeature].title}</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">{features[activeFeature].details}</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-lg text-green-100">
              Get started in minutes with our simple onboarding process
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Set Preferences', desc: 'Tell us about your dietary needs, budget, and lifestyle' },
              { step: '2', title: 'AI Learning', desc: 'Our system learns from your choices and feedback' },
              { step: '3', title: 'Smart Curation', desc: 'Receive personalized grocery boxes weekly' },
              { step: '4', title: 'Enjoy & Feedback', desc: 'Rate items to improve future recommendations' }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">{item.step}</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-green-100">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-lg text-gray-600">
              Join thousands of satisfied customers who've transformed their grocery experience
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Grocery Experience?
          </h2>
          <p className="text-lg text-green-100 mb-8">
            Join thousands of families saving time and reducing food waste with SmartGrocer
          </p>
          <Link href="/onboarding">
            <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
              Start Your Free Trial
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-gradient-to-r from-green-600 to-blue-600 p-2 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">SmartGrocer</span>
              </div>
              <p className="text-gray-400">
                AI-powered grocery subscription service for modern families.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">How It Works</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 SmartGrocer. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}