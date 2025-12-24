'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Plus, Edit, Trash2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { toast } from 'sonner';

export default function SalesRecordsPage() {
  const router = useRouter();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/sales-records', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setRecords(data.data || []);
      } else {
        throw new Error(data.error || 'Failed to fetch sales records');
      }
    } catch (err) {
      console.error('Error fetching sales records:', err);
      setError(err.message);
      toast.error('Failed to load sales records');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this sales record?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/sales-records/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Sales record deleted');
        fetchRecords();
      } else {
        throw new Error(data.error || 'Failed to delete sales record');
      }
    } catch (err) {
      console.error('Error deleting sales record:', err);
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Sales Records</h1>
          <Skeleton className="h-96 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Sales Records</h1>
          <Button onClick={() => router.push('/sales-records/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Sales Record
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              All Sales Records ({records.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {records.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p className="mb-4">No sales records yet</p>
                <Button onClick={() => router.push('/sales-records/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Record
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Invoice No</th>
                      <th className="text-left p-3">Invoice Date</th>
                      <th className="text-left p-3">Due Date</th>
                      <th className="text-left p-3">Product</th>
                      <th className="text-left p-3">Customer</th>
                      <th className="text-left p-3">Quantity</th>
                      <th className="text-left p-3">Pricing</th>
                      <th className="text-left p-3">VAT</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr key={record.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-semibold">{record.invoice_no}</td>
                        <td className="p-3">{new Date(record.invoice_date).toLocaleDateString()}</td>
                        <td className="p-3">{new Date(record.due_date).toLocaleDateString()}</td>
                        <td className="p-3">{record.product_name || record.product}</td>
                        <td className="p-3">{record.customer}</td>
                        <td className="p-3">{record.quantity}</td>
                        <td className="p-3">{record.pricing}</td>
                        <td className="p-3">{record.vat}</td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => router.push(`/sales-records/${record.id}`)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete(record.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}