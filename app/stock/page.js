'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StockList from '@/components/stock/StockList';
import StockForm from '@/components/stock/StockForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function StockPage() {
  const [stockRecords, setStockRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    fetchStockRecords();
  }, []);

  const fetchStockRecords = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/stock-records', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        const records = (data.data || []).map(stock => ({
          ...stock,
          estimated_stock_days: (stock.estimated_stock_days && !isNaN(stock.estimated_stock_days)) 
            ? Number(stock.estimated_stock_days) 
            : null
        }));
        setStockRecords(records);
      } else {
        throw new Error(data.error || 'Failed to fetch stock records');
      }
    } catch (error) {
      console.error('Error fetching stock records:', error);
      toast.error('Failed to load stock records');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSuccess = () => {
    setShowAddDialog(false);
    fetchStockRecords();
    toast.success('Stock record added successfully');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Stock Records</h1>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Stock Record
          </Button>
        </div>

        <StockList stockRecords={stockRecords} loading={loading} onUpdate={fetchStockRecords} />

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Stock Record</DialogTitle>
            </DialogHeader>
            <StockForm onSuccess={handleAddSuccess} onCancel={() => setShowAddDialog(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}