'use client';

import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Plus, Edit, Trash2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { toast } from 'sonner';

export default function ActualSalesPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [formData, setFormData] = useState({
    product_id: '',
    month: '',
    actual_sales_amount: ''
  });

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/actual-sales', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSales(data.data || []);
      } else {
        throw new Error(data.error || 'Failed to fetch actual sales');
      }
    } catch (err) {
      console.error('Error fetching actual sales:', err);
      setError(err.message);
      toast.error('Failed to load actual sales');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingSale 
        ? `/api/actual-sales/${editingSale.id}`
        : '/api/actual-sales';
      const method = editingSale ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(editingSale ? 'Actual sales updated' : 'Actual sales created');
        setShowModal(false);
        setEditingSale(null);
        setFormData({ product_id: '', month: '', actual_sales_amount: '' });
        fetchSales();
      } else {
        throw new Error(data.error || 'Failed to save actual sales');
      }
    } catch (err) {
      console.error('Error saving actual sales:', err);
      toast.error(err.message);
    }
  };

  const handleEdit = (sale) => {
    setEditingSale(sale);
    setFormData({
      product_id: sale.product_id || '',
      month: sale.month || '',
      actual_sales_amount: sale.actual_sales_amount || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this actual sales record?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/actual-sales/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Actual sales deleted');
        fetchSales();
      } else {
        throw new Error(data.error || 'Failed to delete actual sales');
      }
    } catch (err) {
      console.error('Error deleting actual sales:', err);
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Actual Sales</h1>
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
          <h1 className="text-3xl font-bold">Actual Sales</h1>
          <Button onClick={() => { setEditingSale(null); setShowModal(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Actual Sales
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Monthly Actual Sales ({sales.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sales.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                <TrendingUp className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p className="mb-4">No actual sales data yet</p>
                <Button onClick={() => setShowModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Record
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Product ID</th>
                      <th className="text-left p-3">Month</th>
                      <th className="text-left p-3">Actual Sales Amount</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map((sale) => (
                      <tr key={sale.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-semibold">{sale.product_id}</td>
                        <td className="p-3">{sale.month}</td>
                        <td className="p-3">{sale.actual_sales_amount}</td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(sale)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete(sale.id)}>
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

        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSale ? 'Edit' : 'Add'} Actual Sales</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="product_id">Product ID</Label>
                <Input
                  id="product_id"
                  value={formData.product_id}
                  onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="month">Month (YYYY-MM)</Label>
                <Input
                  id="month"
                  type="month"
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="actual_sales_amount">Actual Sales Amount</Label>
                <Input
                  id="actual_sales_amount"
                  value={formData.actual_sales_amount}
                  onChange={(e) => setFormData({ ...formData, actual_sales_amount: e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingSale ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}