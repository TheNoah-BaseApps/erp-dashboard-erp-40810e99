'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StockDetail from '@/components/stock/StockDetail';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function StockDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [stockRecord, setStockRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (params.id) {
      fetchStockRecord();
    }
  }, [params.id]);

  const fetchStockRecord = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/stock-records/${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setStockRecord(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch stock record');
      }
    } catch (err) {
      console.error('Error fetching stock record:', err);
      setError(err.message);
      toast.error('Failed to load stock record details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = () => {
    fetchStockRecord();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
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
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/stock')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Stock Record Details</h1>
        </div>

        {stockRecord && <StockDetail stockRecord={stockRecord} onUpdate={handleUpdate} />}
      </div>
    </DashboardLayout>
  );
}