'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestLogin() {
  const [email, setEmail] = useState('test@smartgrocer.com');
  const [password, setPassword] = useState('test123');
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTestLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    try {
      console.log('Testing login with:', email, password);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('Response status:', response.status);
      console.log('Response data:', data);

      setResult({
        success: response.ok,
        status: response.status,
        data: data
      });
    } catch (error) {
      console.error('Test error:', error);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-center">🔧 Login API Test</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTestLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Testing...' : 'Test Login API'}
              </Button>
            </form>

            {result && (
              <div className="mt-6 p-4 rounded-lg border">
                {result.success ? (
                  <div className="text-green-700">
                    <h3 className="font-bold text-lg">✅ Login Successful!</h3>
                    <p><strong>Status:</strong> {result.status}</p>
                    <p><strong>User:</strong> {result.data.user.firstName} {result.data.user.lastName}</p>
                    <p><strong>Email:</strong> {result.data.user.email}</p>
                    <p><strong>Token:</strong> {result.data.token ? '✅ Received' : '❌ Missing'}</p>
                  </div>
                ) : (
                  <div className="text-red-700">
                    <h3 className="font-bold text-lg">❌ Login Failed</h3>
                    <p><strong>Status:</strong> {result.status}</p>
                    <p><strong>Error:</strong> {result.data?.error || result.error}</p>
                    {result.data?.details && (
                      <pre className="text-xs mt-2 bg-gray-100 p-2 rounded">
                        {JSON.stringify(result.data.details, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 text-center">
              <a href="/" className="text-green-600 hover:text-green-700 text-sm">
                ← Back to Home
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 