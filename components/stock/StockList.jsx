'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, Trash2, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import StockLevelIndicator from '@/components/shared/StockLevelIndicator';

export default function StockList({ stockRecords, loading, onUpdate }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const filteredStockRecords = stockRecords.filter(stock =>
    stock.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.part_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.warehouse_location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      setDeleting(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/stock-records/${deleteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast.success('Stock record deleted successfully');
        onUpdate();
      } else {
        throw new Error(data.error || 'Failed to delete stock record');
      }
    } catch (error) {
      console.error('Error deleting stock record:', error);
      toast.error(error.message);
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search stock by product, part number, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Part Number</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Current Amount</TableHead>
              <TableHead>Est. Days</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStockRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No stock records found
                </TableCell>
              </TableRow>
            ) : (
              filteredStockRecords.map((stock) => (
                <TableRow key={stock.id}>
                  <TableCell className="font-medium">{stock.product_name || 'N/A'}</TableCell>
                  <TableCell>{stock.part_number}</TableCell>
                  <TableCell>{stock.warehouse_location}</TableCell>
                  <TableCell>
                    {stock.current_amount} {stock.unit}
                  </TableCell>
                  <TableCell>
                    {stock.estimated_stock_days ? stock.estimated_stock_days.toFixed(1) : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <StockLevelIndicator
                      estimatedStockDays={stock.estimated_stock_days}
                      criticalLevelDays={stock.critical_level_days}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/stock/${stock.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(stock.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Stock Record"
        description="Are you sure you want to delete this stock record? This action cannot be undone."
        loading={deleting}
      />
    </div>
  );
}