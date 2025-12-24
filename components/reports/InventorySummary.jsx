'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { exportToCSV, prepareProductsForExport } from '@/lib/export';
import DataTable from '@/components/shared/DataTable';

export default function InventorySummary() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/reports/inventory-summary', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSummary(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch inventory summary');
      }
    } catch (err) {
      console.error('Error fetching inventory summary:', err);
      setError(err.message);
      toast.error('Failed to load inventory summary');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      if (summary?.products) {
        const exportData = prepareProductsForExport(summary.products);
        await exportToCSV(exportData, 'inventory-summary');
        toast.success('Report exported successfully');
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
    }
  };

  if (loading) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const columns = [
    { header: 'Product', accessor: 'product_name' },
    { header: 'Category', accessor: 'product_category' },
    { header: 'Total Stock', accessor: 'total_stock' },
    { header: 'Critical Level', accessor: 'critical_stock_level' },
    { header: 'Status', accessor: 'status' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Inventory Summary</h2>
        <Button onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summary?.totalProducts || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Critical Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{summary?.criticalItems || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summary?.totalCategories || 0}</p>
          </CardContent>
        </Card>
      </div>

      {summary?.products && (
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={summary.products} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}