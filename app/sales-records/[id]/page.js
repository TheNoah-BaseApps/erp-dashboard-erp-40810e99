'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Trash2, FileText } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { toast } from 'sonner';

export default function SalesRecordEditPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    invoice_date: '',
    due_date: '',
    invoice_no: '',
    product_id: '',
    part_no: '',
    customer: '',
    quantity: '',
    pricing: '',
    vat: ''
  });

  useEffect(() => {
    fetchProducts();
    if (id !== 'new') {
      fetchSalesRecord();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setProducts(data.data || []);
      } else {
        console.error('Failed to fetch products:', data.error);
        toast.error('Failed to load products');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      toast.error('Error loading products');
    }
  };

  const fetchSalesRecord = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/sales-records/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const record = data.data;
        setFormData({
          invoice_date: record.invoice_date ? record.invoice_date.split('T')[0] : '',
          due_date: record.due_date ? record.due_date.split('T')[0] : '',
          invoice_no: record.invoice_no || '',
          product_id: record.product_id || '',
          part_no: record.part_no || '',
          customer: record.customer || '',
          quantity: record.quantity?.toString() || '',
          pricing: record.pricing || '',
          vat: record.vat || ''
        });
      } else {
        throw new Error(data.error || 'Failed to fetch sales record');
      }
    } catch (err) {
      console.error('Error fetching sales record:', err);
      setError(err.message);
      toast.error('Failed to load sales record');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const url = id === 'new' ? '/api/sales-records' : `/api/sales-records/${id}`;
      const method = id === 'new' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          quantity: parseInt(formData.quantity, 10)
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(id === 'new' ? 'Sales record created' : 'Sales record updated');
        router.push('/sales-records');
      } else {
        throw new Error(data.error || 'Failed to save sales record');
      }
    } catch (err) {
      console.error('Error saving sales record:', err);
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
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
        router.push('/sales-records');
      } else {
        throw new Error(data.error || 'Failed to delete sales record');
      }
    } catch (err) {
      console.error('Error deleting sales record:', err);
      toast.error(err.message);
    }
  };

  const handleProductChange = (productId) => {
    const selectedProduct = products.find(p => p.id === productId);
    setFormData({
      ...formData,
      product_id: productId,
      part_no: selectedProduct?.product_code || ''
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
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
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.push('/sales-records')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">
              {id === 'new' ? 'New Sales Record' : 'Edit Sales Record'}
            </h1>
          </div>
          {id !== 'new' && (
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Sales Record Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoice_no">Invoice Number *</Label>
                  <Input
                    id="invoice_no"
                    value={formData.invoice_no}
                    onChange={(e) => setFormData({ ...formData, invoice_no: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="customer">Customer *</Label>
                  <Input
                    id="customer"
                    value={formData.customer}
                    onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="invoice_date">Invoice Date *</Label>
                  <Input
                    id="invoice_date"
                    type="date"
                    value={formData.invoice_date}
                    onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="due_date">Due Date *</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="product_id">Product</Label>
                  <Select value={formData.product_id} onValueChange={handleProductChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.product_name} ({product.product_code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="part_no">Part Number</Label>
                  <Input
                    id="part_no"
                    value={formData.part_no}
                    onChange={(e) => setFormData({ ...formData, part_no: e.target.value })}
                    disabled
                  />
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="pricing">Pricing *</Label>
                  <Input
                    id="pricing"
                    value={formData.pricing}
                    onChange={(e) => setFormData({ ...formData, pricing: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="vat">VAT *</Label>
                  <Input
                    id="vat"
                    value={formData.vat}
                    onChange={(e) => setFormData({ ...formData, vat: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => router.push('/sales-records')}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}