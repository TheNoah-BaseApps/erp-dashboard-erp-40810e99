'use client';

import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';

export default function AlertBadge({ type = 'warning', children }) {
  const variants = {
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    error: 'bg-red-100 text-red-800 border-red-300',
    info: 'bg-blue-100 text-blue-800 border-blue-300'
  };

  return (
    <Badge variant="outline" className={variants[type]}>
      <AlertTriangle className="h-3 w-3 mr-1" />
      {children}
    </Badge>
  );
}