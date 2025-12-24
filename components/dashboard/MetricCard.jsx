'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MetricCard({ title, value, description, variant = 'default' }) {
  const variantStyles = {
    default: 'text-gray-900',
    error: 'text-red-600',
    warning: 'text-orange-600',
    success: 'text-green-600'
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold ${variantStyles[variant]}`}>{value}</div>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}