'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ProductForm from './ProductForm';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { formatDateTime } from '@/lib/calculations';

export default function ProductDetail({ product, onUpdate }) {
  const router = useRouter();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleEditSuccess = () => {
    setShowEditDialog(false);
    onUpdate();
    toast.success('Product updated successfully');
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Product deleted successfully');
        router.push('/products');
      } else {
        throw new Error(data.error || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
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
            <CardTitle>{product.product_name}</CardTitle>
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
              <label className="text-sm font-medium text-gray-600">Product Code</label>
              <p className="text-lg font-semibold">{product.product_code}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Category</label>
              <div className="mt-1">
                <Badge variant="outline">{product.product_category}</Badge>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Brand</label>
              <p className="text-lg">{product.brand || 'N/A'}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Unit</label>
              <p className="text-lg">{product.unit}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Critical Stock Level</label>
              <p className="text-lg">{product.critical_stock_level}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Created At</label>
              <p className="text-lg">{formatDateTime(product.created_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <ProductForm
            product={product}
            onSuccess={handleEditSuccess}
            onCancel={() => setShowEditDialog(false)}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
        loading={deleting}
      />
    </>
  );
}