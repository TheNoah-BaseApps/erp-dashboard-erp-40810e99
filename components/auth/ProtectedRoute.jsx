'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProtectedRoute({ children, requiredRole = null }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token) {
      router.push('/login');
      return;
    }

    if (requiredRole && userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role !== requiredRole) {
          router.push('/dashboard');
          return;
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        router.push('/login');
        return;
      }
    }

    setIsAuthorized(true);
    setLoading(false);
  }, [router, requiredRole]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}