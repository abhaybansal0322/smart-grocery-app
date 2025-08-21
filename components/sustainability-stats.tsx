'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Leaf, MapPin, Calendar, TrendingUp, Globe } from 'lucide-react';
import { useSustainability } from '@/hooks/use-api';

export default function SustainabilityStats() {
  const { data, loading, error } = useSustainability();

  if (loading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Sustainability Impact</h2>
            <div className="grid md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="text-center">
                    <div className="h-12 w-12 bg-gray-200 rounded-full mx-auto mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Sustainability Impact</h2>
            <p className="text-red-600">Error loading sustainability data: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (!data?.data) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Sustainability Impact</h2>
            <p className="text-gray-600">Sustainability data not available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  const { overview, byCategory, topSustainable } = data.data;

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Sustainability Impact</h2>
          <p className="text-lg text-gray-600">
            Making conscious choices for a better planet, one grocery box at a time
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          <Card className="text-center">
            <CardHeader className="pb-2">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2">
                <Leaf className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-lg">Organic Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {overview.organicPercentage.toFixed(1)}%
              </div>
              <p className="text-sm text-gray-600">
                {overview.organicProducts} out of {overview.totalProducts} products
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader className="pb-2">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2">
                <MapPin className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Local Sourcing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {overview.localPercentage.toFixed(1)}%
              </div>
              <p className="text-sm text-gray-600">
                {overview.localProducts} locally sourced products
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader className="pb-2">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2">
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
              <CardTitle className="text-lg">Seasonal Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {overview.seasonalPercentage.toFixed(1)}%
              </div>
              <p className="text-sm text-gray-600">
                {overview.seasonalProducts} seasonal products
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader className="pb-2">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Carbon Footprint</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {overview.averageCarbonFootprint.toFixed(1)}
              </div>
              <p className="text-sm text-gray-600">
                kg CO₂ average per product
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdown */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Sustainability by Category</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {byCategory.map((category) => (
              <Card key={category.category} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="capitalize">{category.category}</span>
                    <Badge variant="outline" className="text-xs">
                      {category.count} products
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Avg Carbon Footprint:</span>
                      <span className="font-semibold">
                        {category.avgCarbonFootprint.toFixed(1)} kg CO₂
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min((category.avgCarbonFootprint / 5) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500">
                      {category.avgCarbonFootprint < 1 ? 'Excellent' : 
                       category.avgCarbonFootprint < 2 ? 'Good' : 
                       category.avgCarbonFootprint < 3 ? 'Fair' : 'High'} sustainability rating
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Top Sustainable Products */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Top Sustainable Products</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {topSustainable.slice(0, 10).map((product) => (
              <Card key={product.id} className="text-center hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-2">
                  <img
                    src={(product as any).images?.[0]?.url || product.imageUrl || 'https://via.placeholder.com/100x100?text=Product'}
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded-lg mx-auto mb-2"
                  />
                  <CardTitle className="text-sm font-medium line-clamp-2">
                    {product.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-1">
                      {product.isOrganic && (
                        <Badge className="bg-green-600 text-white text-xs px-1 py-0">
                          <Leaf className="h-2 w-2" />
                        </Badge>
                      )}
                      {product.isLocal && (
                        <Badge className="bg-blue-600 text-white text-xs px-1 py-0">
                          <MapPin className="h-2 w-2" />
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-gray-600">
                      <Globe className="h-3 w-3 inline mr-1" />
                      {product.carbonFootprint.toFixed(1)} kg CO₂
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
