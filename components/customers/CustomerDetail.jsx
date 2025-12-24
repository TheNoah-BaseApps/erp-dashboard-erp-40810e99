'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CustomerForm from './CustomerForm';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { formatDateTime, formatCurrency } from '@/lib/calculations';

export default function CustomerDetail({ customer, onUpdate }) {
  const router = useRouter();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleEditSuccess = () => {
    setShowEditDialog(false);
    onUpdate();
    toast.success('Customer updated successfully');
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/customers/${customer.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Customer deleted successfully');
        router.push('/customers');
      } else {
        throw new Error(data.error || 'Failed to delete customer');
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
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
            <CardTitle>{customer.customer_name}</CardTitle>
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
              <label className="text-sm font-medium text-gray-600">Customer Code</label>
              <p className="text-lg font-semibold">{customer.customer_code}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Contact Person</label>
              <p className="text-lg">{customer.contact_person || 'N/A'}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <p className="text-lg">{customer.email || 'N/A'}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Phone</label>
              <p className="text-lg">{customer.telephone_number || 'N/A'}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Sales Representative</label>
              <p className="text-lg">{customer.sales_rep}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Payment Terms Limit</label>
              <p className="text-lg">{formatCurrency(customer.payment_terms_limit)}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Balance Risk Limit</label>
              <p className="text-lg">{formatCurrency(customer.balance_risk_limit)}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Created At</label>
              <p className="text-lg">{formatDateTime(customer.created_at)}</p>
            </div>

            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-600">Address</label>
              <p className="text-lg">{customer.address || 'N/A'}</p>
              {(customer.city_or_district || customer.region_or_state || customer.country) && (
                <p className="text-sm text-gray-600 mt-1">
                  {[customer.city_or_district, customer.region_or_state, customer.country]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          <CustomerForm
            customer={customer}
            onSuccess={handleEditSuccess}
            onCancel={() => setShowEditDialog(false)}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        title="Delete Customer"
        description="Are you sure you want to delete this customer? This action cannot be undone."
        loading={deleting}
      />
    </>
  );
}