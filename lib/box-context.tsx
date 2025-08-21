'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './auth-context';

interface BoxItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  category: string;
  imageUrl?: string;
  organic?: boolean;
}

interface CurrentBox {
  items: BoxItem[];
  total: number;
  deliveryDate: string;
  status: string;
}

interface BoxContextType {
  currentBox: CurrentBox | null;
  updateCurrentBox: (box: CurrentBox) => void;
  addToBox: (product: any) => void;
  removeFromBox: (productId: number) => void;
  refreshBox: () => void;
  isLoading: boolean;
}

const BoxContext = createContext<BoxContextType | undefined>(undefined);

export function BoxProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [currentBox, setCurrentBox] = useState<CurrentBox | null>(null);
  const [isLoading, setIsLoading] = useState(false);



  const fetchCurrentBox = useCallback(async () => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch('/api/boxes/current', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        setCurrentBox(data.box);
      } else {
        // Initialize with empty box if API fails
        setCurrentBox({
          items: [],
          total: 0,
          deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
          status: 'customizing'
        });
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        console.log('Request timed out, using fallback box');
      }
      // Initialize with empty box if fetch fails
      setCurrentBox({
        items: [],
        total: 0,
        deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
        status: 'customizing'
      });
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const updateCurrentBox = useCallback(async (box: CurrentBox) => {
    if (!token) return;
    
    try {
      const response = await fetch('/api/boxes/current', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ box })
      });
      
      if (response.ok) {
        setCurrentBox(box);
      }
    } catch (error) {
      console.error('Failed to update current box:', error);
    }
  }, [token]);

  const addToBox = useCallback((product: any) => {
    if (!currentBox) {
      // Initialize box if it doesn't exist
      const newBox = {
        items: [{ ...product, quantity: 1 }],
        total: product.price,
        deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'customizing'
      };
      updateCurrentBox(newBox);
      return;
    }
    
    const existingItem = currentBox.items.find(item => item.id === product.id);
    
    if (existingItem) {
      const updatedBox = {
        ...currentBox,
        items: currentBox.items.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
        total: currentBox.total + product.price
      };
      updateCurrentBox(updatedBox);
    } else {
      const updatedBox = {
        ...currentBox,
        items: [...currentBox.items, { ...product, quantity: 1 }],
        total: currentBox.total + product.price
      };
      updateCurrentBox(updatedBox);
    }
  }, [currentBox, updateCurrentBox]);

  const removeFromBox = useCallback((productId: number) => {
    if (!currentBox) return;
    
    const item = currentBox.items.find(item => item.id === productId);
    if (!item) return;
    
    if (item.quantity > 1) {
      const updatedBox = {
        ...currentBox,
        items: currentBox.items.map(item => 
          item.id === productId 
            ? { ...item, quantity: item.quantity - 1 }
            : item
        ),
        total: currentBox.total - item.price
      };
      updateCurrentBox(updatedBox);
    } else {
      const updatedBox = {
        ...currentBox,
        items: currentBox.items.filter(item => item.id !== productId),
        total: currentBox.total - item.price
      };
      updateCurrentBox(updatedBox);
    }
  }, [currentBox, updateCurrentBox]);

  const refreshBox = useCallback(() => {
    fetchCurrentBox();
  }, [fetchCurrentBox]);

  useEffect(() => {
    if (token) {
      fetchCurrentBox();
    } else {
      // Initialize with empty box if no token (for development/testing)
      setCurrentBox({
        items: [],
        total: 0,
        deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'customizing'
      });
    }
  }, [token]); // Only depend on token, not fetchCurrentBox

  return (
    <BoxContext.Provider value={{
      currentBox,
      updateCurrentBox,
      addToBox,
      removeFromBox,
      refreshBox,
      isLoading
    }}>
      {children}
    </BoxContext.Provider>
  );
}

export function useBox() {
  const context = useContext(BoxContext);
  if (context === undefined) {
    throw new Error('useBox must be used within a BoxProvider');
  }
  return context;
} 