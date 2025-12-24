'use client';

import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import { getStockStatus } from '@/lib/calculations';

export default function CriticalStockBadge({ currentAmount, criticalStockLevel }) {
  const status = getStockStatus(currentAmount, criticalStockLevel);

  const statusConfig = {
    out_of_stock: {
      label: 'Out of Stock',
      className: 'bg-red-100 text-red-800 border-red-300'
    },
    critical: {
      label: 'Critical',
      className: 'bg-red-100 text-red-800 border-red-300'
    },
    low: {
      label: 'Low Stock',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-300'
    },
    adequate: {
      label: 'Adequate',
      className: 'bg-green-100 text-green-800 border-green-300'
    }
  };

  const config = statusConfig[status] || statusConfig.adequate;

  return (
    <Badge variant="outline" className={config.className}>
      {(status === 'critical' || status === 'out_of_stock') && (
        <AlertTriangle className="h-3 w-3 mr-1" />
      )}
      {config.label}
    </Badge>
  );
}