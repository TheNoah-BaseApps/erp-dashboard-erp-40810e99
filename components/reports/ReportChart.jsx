'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ReportChart({ title, data, type = 'bar' }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center border rounded bg-gray-50">
          <p className="text-gray-500">Chart visualization ({type})</p>
        </div>
      </CardContent>
    </Card>
  );
}