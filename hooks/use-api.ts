import { useState, useEffect } from 'react';

interface ApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  price: number;
  unit: string;
  isOrganic: boolean;
  isLocal: boolean;
  isSeasonal: boolean;
  imageUrl?: string;
  brand?: string;
  stockLevel: number;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  carbonFootprint?: number;
  recommendationScore?: number;
}

interface Category {
  name: string;
  count: number;
  subcategories: string[];
}

interface SustainabilityData {
  overview: {
    totalProducts: number;
    organicProducts: number;
    localProducts: number;
    seasonalProducts: number;
    organicPercentage: number;
    localPercentage: number;
    seasonalPercentage: number;
    averageCarbonFootprint: number;
  };
  byCategory: Array<{
    category: string;
    count: number;
    avgCarbonFootprint: number;
  }>;
  topSustainable: Array<{
    id: string;
    name: string;
    category: string;
    carbonFootprint: number;
    isOrganic: boolean;
    isLocal: boolean;
    imageUrl?: string;
  }>;
}

interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message: string;
}

interface CategoriesResponse {
  categories: Category[];
  message: string;
}

interface SustainabilityResponse {
  data: SustainabilityData;
  message: string;
}

interface RecommendationsResponse {
  products: Product[];
  userProfile: {
    dietaryRestrictions: any;
    sustainabilityImportance: number;
    weeklyBudget: number;
  };
  message: string;
}

// Base API configuration
const API_BASE = '/api';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Helper function to make authenticated API calls
const apiCall = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Custom hooks for different API endpoints
export const useProducts = (filters?: {
  category?: string;
  organic?: boolean;
  local?: boolean;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  page?: number;
}): ApiResponse<ProductsResponse> => {
  const [data, setData] = useState<ProductsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params = new URLSearchParams();
        if (filters?.category) params.append('category', filters.category);
        if (filters?.organic !== undefined) params.append('organic', filters.organic.toString());
        if (filters?.local !== undefined) params.append('local', filters.local.toString());
        if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
        if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
        if (filters?.limit) params.append('limit', filters.limit.toString());
        if (filters?.page) params.append('page', filters.page.toString());

        const response = await apiCall<ProductsResponse>(`/products?${params.toString()}`);
        setData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  return { data, loading, error };
};

export const useFeaturedProducts = (category?: string, limit?: number): ApiResponse<{ products: Product[]; message: string }> => {
  const [data, setData] = useState<{ products: Product[]; message: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (limit) params.append('limit', limit.toString());

        const response = await apiCall<{ products: Product[]; message: string }>(`/products/featured?${params.toString()}`);
        setData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch featured products');
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, [category, limit]);

  return { data, loading, error };
};

export const useCategories = (): ApiResponse<CategoriesResponse> => {
  const [data, setData] = useState<CategoriesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiCall<CategoriesResponse>('/categories');
        setData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { data, loading, error };
};

export const useSustainability = (): ApiResponse<SustainabilityResponse> => {
  const [data, setData] = useState<SustainabilityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSustainability = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiCall<SustainabilityResponse>('/sustainability');
        setData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch sustainability data');
      } finally {
        setLoading(false);
      }
    };

    fetchSustainability();
  }, []);

  return { data, loading, error };
};

export const useRecommendations = (category?: string, limit?: number): ApiResponse<RecommendationsResponse> => {
  const [data, setData] = useState<RecommendationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (limit) params.append('limit', limit.toString());

        const response = await apiCall<RecommendationsResponse>(`/recommendations?${params.toString()}`);
        setData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch recommendations');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [category, limit]);

  return { data, loading, error };
};

// Utility function for manual API calls
export const fetchProducts = (filters?: any): Promise<ProductsResponse> => {
  const params = new URLSearchParams();
  if (filters?.category) params.append('category', filters.category);
  if (filters?.organic !== undefined) params.append('organic', filters.organic.toString());
  if (filters?.local !== undefined) params.append('local', filters.local.toString());
  if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
  if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());
  if (filters?.page) params.append('page', filters.page.toString());

  return apiCall<ProductsResponse>(`/products?${params.toString()}`);
};

export const fetchFeaturedProducts = (category?: string, limit?: number): Promise<{ products: Product[]; message: string }> => {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (limit) params.append('limit', limit.toString());

  return apiCall<{ products: Product[]; message: string }>(`/products/featured?${params.toString()}`);
};

export const fetchCategories = (): Promise<CategoriesResponse> => {
  return apiCall<CategoriesResponse>('/categories');
};

export const fetchSustainability = (): Promise<SustainabilityResponse> => {
  return apiCall<SustainabilityResponse>('/sustainability');
};

export const fetchRecommendations = (category?: string, limit?: number): Promise<RecommendationsResponse> => {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (limit) params.append('limit', limit.toString());

  return apiCall<RecommendationsResponse>(`/recommendations?${params.toString()}`);
};
