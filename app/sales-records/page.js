'use client';

import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Plus, Edit, Trash2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { toast } from 'sonner';

export default function SalesRecordsPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    invoice_date: '',
    due_date: '',
    invoice_no: '',
    product: '',
    part_no: '',
    customer: '',
    quantity: '',
    pricing: '',
    vat: ''
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingRecord 
        ? `/api/sales-records/${editingRecord.id}`
        : '/api/sales-records';
      const method = editingRecord ? 'PUT' : 'POST';

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
        toast.success(editingRecord ? 'Sales record updated' : 'Sales record created');
        setShowModal(false);
        setEditingRecord(null);
        setFormData({
          invoice_date: '',
          due_date: '',
          invoice_no: '',
          product: '',
          part_no: '',
          customer: '',
          quantity: '',
          pricing: '',
          vat: ''
        });
        fetchRecords();
      } else {
        throw new Error(data.error || 'Failed to save sales record');
      }
    } catch (err) {
      console.error('Error saving sales record:', err);
      toast.error(err.message);
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      invoice_date: record.invoice_date?.split('T')[0] || '',
      due_date: record.due_date?.split('T')[0] || '',
      invoice_no: record.invoice_no || '',
      product: record.product || '',
      part_no: record.part_no || '',
      customer: record.customer || '',
      quantity: record.quantity || '',
      pricing: record.pricing || '',
      vat: record.vat || ''
    });
    setShowModal(true);
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
          <Button onClick={() => { setEditingRecord(null); setShowModal(true); }}>
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
                        <td className="p-3">{record.product}</td>
                        <td className="p-3">{record.customer}</td>
                        <td className="p-3">{record.quantity}</td>
                        <td className="p-3">{record.pricing}</td>
                        <td className="p-3">{record.vat}</td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(record)}>
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

        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingRecord ? 'Edit' : 'Add'} Sales Record</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoice_no">Invoice No</Label>
                  <Input
                    id="invoice_no"
                    value={formData.invoice_no}
                    onChange={(e) => setFormData({ ...formData, invoice_no: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="invoice_date">Invoice Date</Label>
                  <Input
                    id="invoice_date"
                    type="date"
                    value={formData.invoice_date}
                    onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="product">Product</Label>
                  <Input
                    id="product"
                    value={formData.product}
                    onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="part_no">Part No</Label>
                  <Input
                    id="part_no"
                    value={formData.part_no}
                    onChange={(e) => setFormData({ ...formData, part_no: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="customer">Customer</Label>
                  <Input
                    id="customer"
                    value={formData.customer}
                    onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="pricing">Pricing</Label>
                  <Input
                    id="pricing"
                    value={formData.pricing}
                    onChange={(e) => setFormData({ ...formData, pricing: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="vat">VAT</Label>
                  <Input
                    id="vat"
                    value={formData.vat}
                    onChange={(e) => setFormData({ ...formData, vat: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingRecord ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}