'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { exportToCSV, prepareStockForExport } from '@/lib/export';
import DataTable from '@/components/shared/DataTable';

export default function StockMovement() {
  const [movement, setMovement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMovement();
  }, []);

  const fetchMovement = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/reports/stock-movement', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMovement(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch stock movement');
      }
    } catch (err) {
      console.error('Error fetching stock movement:', err);
      setError(err.message);
      toast.error('Failed to load stock movement');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      if (movement?.stockRecords) {
        const exportData = prepareStockForExport(movement.stockRecords);
        await exportToCSV(exportData, 'stock-movement');
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
    { header: 'Part Number', accessor: 'part_number' },
    { header: 'Location', accessor: 'warehouse_location' },
    { header: 'Current Amount', accessor: 'current_amount' },
    { header: 'Consumption Rate', accessor: 'consumption_rate' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Stock Movement</h2>
        <Button onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{movement?.totalItems || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">{movement?.lowStockItems || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Expiring Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{movement?.expiringItems || 0}</p>
          </CardContent>
        </Card>
      </div>

      {movement?.stockRecords && (
        <Card>
          <CardHeader>
            <CardTitle>Stock Movement Details</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={movement.stockRecords} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}