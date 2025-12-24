'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import StockForm from './StockForm';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { formatDate, formatDateTime } from '@/lib/calculations';
import StockLevelIndicator from '@/components/shared/StockLevelIndicator';
import ExpiryWarning from '@/components/shared/ExpiryWarning';

export default function StockDetail({ stockRecord, onUpdate }) {
  const router = useRouter();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleEditSuccess = () => {
    setShowEditDialog(false);
    onUpdate();
    toast.success('Stock record updated successfully');
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/stock-records/${stockRecord.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Stock record deleted successfully');
        router.push('/stock');
      } else {
        throw new Error(data.error || 'Failed to delete stock record');
      }
    } catch (error) {
      console.error('Error deleting stock record:', error);
      toast.error(error.message);
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{stockRecord.product_name || 'Stock Record'}</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => setShowEditDialog(true)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setShowDeleteDialog(true)}>
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-600">Part Number</label>
              <p className="text-lg font-semibold">{stockRecord.part_number}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Warehouse Location</label>
              <p className="text-lg">{stockRecord.warehouse_location}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Current Amount</label>
              <p className="text-lg">{stockRecord.current_amount} {stockRecord.unit}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Consumption Rate</label>
              <p className="text-lg">
                {stockRecord.consumption_rate ? `${stockRecord.consumption_rate} ${stockRecord.unit}/day` : 'N/A'}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Estimated Stock Days</label>
              <p className="text-lg">
                {stockRecord.estimated_stock_days ? stockRecord.estimated_stock_days.toFixed(1) : 'N/A'}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Critical Level Days</label>
              <p className="text-lg">{stockRecord.critical_level_days}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Stock Status</label>
              <div className="mt-1">
                <StockLevelIndicator
                  estimatedStockDays={stockRecord.estimated_stock_days}
                  criticalLevelDays={stockRecord.critical_level_days}
                />
              </div>
            </div>

            {stockRecord.expiry_date && (
              <div>
                <label className="text-sm font-medium text-gray-600">Expiry Status</label>
                <div className="mt-1">
                  <ExpiryWarning expiryDate={stockRecord.expiry_date} />
                </div>
              </div>
            )}

            {stockRecord.first_sales_date && (
              <div>
                <label className="text-sm font-medium text-gray-600">First Sales Date</label>
                <p className="text-lg">{formatDate(stockRecord.first_sales_date)}</p>
              </div>
            )}

            {stockRecord.expiry_date && (
              <div>
                <label className="text-sm font-medium text-gray-600">Expiry Date</label>
                <p className="text-lg">{formatDate(stockRecord.expiry_date)}</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-600">Created At</label>
              <p className="text-lg">{formatDateTime(stockRecord.created_at)}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Last Updated</label>
              <p className="text-lg">{formatDateTime(stockRecord.updated_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Stock Record</DialogTitle>
          </DialogHeader>
          <StockForm
            stockRecord={stockRecord}
            onSuccess={handleEditSuccess}
            onCancel={() => setShowEditDialog(false)}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        title="Delete Stock Record"
        description="Are you sure you want to delete this stock record? This action cannot be undone."
        loading={deleting}
      />
    </>
  );
}