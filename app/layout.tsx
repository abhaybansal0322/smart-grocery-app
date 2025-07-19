import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { BoxProvider } from '@/lib/box-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SmartGrocer - AI-Driven Grocery Subscription',
  description: 'Smart grocery subscription service powered by AI. Save time, reduce waste, and enjoy personalized grocery boxes delivered to your door.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <BoxProvider>
            {children}
          </BoxProvider>
        </AuthProvider>
      </body>
    </html>
  );
}