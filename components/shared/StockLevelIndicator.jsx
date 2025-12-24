'use client';

import { Badge } from '@/components/ui/badge';
import { isStockCritical } from '@/lib/calculations';

export default function StockLevelIndicator({ estimatedStockDays, criticalLevelDays }) {
  if (!estimatedStockDays || !criticalLevelDays) {
    return <Badge variant="outline">Unknown</Badge>;
  }

  const isCritical = isStockCritical(estimatedStockDays, criticalLevelDays);
  const isLow = estimatedStockDays <= criticalLevelDays * 1.5;

  if (isCritical) {
    return (
      <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
        Critical
      </Badge>
    );
  }

  if (isLow) {
    return (
      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
        Low
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
      Adequate
    </Badge>
  );
}