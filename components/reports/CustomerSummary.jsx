'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { exportToCSV, prepareCustomersForExport } from '@/lib/export';
import DataTable from '@/components/shared/DataTable';

export default function CustomerSummary() {
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
      const response = await fetch('/api/reports/customer-summary', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSummary(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch customer summary');
      }
    } catch (err) {
      console.error('Error fetching customer summary:', err);
      setError(err.message);
      toast.error('Failed to load customer summary');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      if (summary?.customers) {
        const exportData = prepareCustomersForExport(summary.customers);
        await exportToCSV(exportData, 'customer-summary');
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
    { header: 'Customer', accessor: 'customer_name' },
    { header: 'Code', accessor: 'customer_code' },
    { header: 'Sales Rep', accessor: 'sales_rep' },
    { header: 'Region', accessor: 'region_or_state' },
    { header: 'Country', accessor: 'country' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Customer Summary</h2>
        <Button onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summary?.totalCustomers || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Active Regions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summary?.totalRegions || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Countries</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summary?.totalCountries || 0}</p>
          </CardContent>
        </Card>
      </div>

      {summary?.customers && (
        <Card>
          <CardHeader>
            <CardTitle>Customer Details</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={summary.customers} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}