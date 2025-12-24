'use client';

import { Badge } from '@/components/ui/badge';
import { getDaysUntilExpiry, isExpiryWarning, isExpired } from '@/lib/calculations';
import { Calendar, AlertTriangle } from 'lucide-react';

export default function ExpiryWarning({ expiryDate }) {
  if (!expiryDate) {
    return null;
  }

  const daysUntilExpiry = getDaysUntilExpiry(expiryDate);

  if (isExpired(expiryDate)) {
    return (
      <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
        <AlertTriangle className="h-3 w-3 mr-1" />
        Expired
      </Badge>
    );
  }

  if (isExpiryWarning(expiryDate)) {
    return (
      <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
        <Calendar className="h-3 w-3 mr-1" />
        Expires in {daysUntilExpiry} days
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
      <Calendar className="h-3 w-3 mr-1" />
      {daysUntilExpiry} days remaining
    </Badge>
  );
}