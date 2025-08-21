'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Leaf, MapPin, Calendar, Star } from 'lucide-react';
import { useFeaturedProducts } from '@/hooks/use-api';

interface FeaturedProductsProps {
  category?: string;
  limit?: number;
  title?: string;
  showViewAll?: boolean;
}

export default function FeaturedProducts({ 
  category, 
  limit = 8, 
  title = "Featured Products",
  showViewAll = true 
}: FeaturedProductsProps) {
  const { data, loading, error } = useFeaturedProducts(category, limit);

  if (loading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
            <div className="grid md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-2">
                    <div className="h-48 bg-gray-200 rounded-lg mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
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
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
            <p className="text-red-600">Error loading products: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (!data?.products || data.products.length === 0) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
            <p className="text-gray-600">No products available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-lg text-gray-600">
            Discover our carefully curated selection of fresh, sustainable products
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.products.map((product) => (
            <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
              <CardHeader className="pb-2">
                <div className="relative">
                  <img
                    src={(product.images && product.images[0]?.url) || product.imageUrl || 'https://via.placeholder.com/300x200?text=Product'}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {product.isOrganic && (
                      <Badge className="bg-green-600 text-white text-xs">
                        <Leaf className="h-3 w-3 mr-1" />
                        Organic
                      </Badge>
                    )}
                    {product.isLocal && (
                      <Badge className="bg-blue-600 text-white text-xs">
                        <MapPin className="h-3 w-3 mr-1" />
                        Local
                      </Badge>
                    )}
                    {product.isSeasonal && (
                      <Badge className="bg-orange-600 text-white text-xs">
                        <Calendar className="h-3 w-3 mr-1" />
                        Seasonal
                      </Badge>
                    )}
                  </div>
                  {product.recommendationScore && product.recommendationScore > 5 && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-yellow-500 text-white text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        Top Pick
                      </Badge>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                    {product.name}
                  </h3>
                  
                  {product.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-green-600">
                      ${product.price.toFixed(2)}
                      <span className="text-sm text-gray-500 font-normal ml-1">
                        /{product.unit}
                      </span>
                    </div>
                    
                    {product.brand && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {product.brand}
                      </span>
                    )}
                  </div>
                  
                  {product.carbonFootprint && (
                    <div className="flex items-center text-xs text-gray-500">
                      <Leaf className="h-3 w-3 mr-1" />
                      {product.carbonFootprint.toFixed(1)} kg CO₂
                    </div>
                  )}
                  
                  {product.stockLevel < 20 && (
                    <div className="text-xs text-orange-600 font-medium">
                      Only {product.stockLevel} left in stock
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {showViewAll && (
          <div className="text-center mt-8">
            <button className="inline-flex items-center px-6 py-3 border border-green-600 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-colors">
              View All Products
              <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
