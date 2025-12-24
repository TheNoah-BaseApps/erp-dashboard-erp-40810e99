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
import { ArrowLeft, Save, Trash2, DollarSign } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { toast } from 'sonner';

export default function ProductCostEditPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    product_id: '',
    month: '',
    unit_cost: ''
  });

  useEffect(() => {
    fetchProducts();
    if (id !== 'new') {
      fetchProductCost();
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
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchProductCost = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/product-costs/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const record = data.data;
        setFormData({
          product_id: record.product_id || '',
          month: record.month || '',
          unit_cost: record.unit_cost || ''
        });
      } else {
        throw new Error(data.error || 'Failed to fetch product cost');
      }
    } catch (err) {
      console.error('Error fetching product cost:', err);
      setError(err.message);
      toast.error('Failed to load product cost');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const url = id === 'new' ? '/api/product-costs' : `/api/product-costs/${id}`;
      const method = id === 'new' ? 'POST' : 'PUT';

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
        toast.success(id === 'new' ? 'Product cost created' : 'Product cost updated');
        router.push('/product-costs');
      } else {
        throw new Error(data.error || 'Failed to save product cost');
      }
    } catch (err) {
      console.error('Error saving product cost:', err);
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product cost record?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/product-costs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Product cost deleted');
        router.push('/product-costs');
      } else {
        throw new Error(data.error || 'Failed to delete product cost');
      }
    } catch (err) {
      console.error('Error deleting product cost:', err);
      toast.error(err.message);
    }
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
            <Button variant="outline" onClick={() => router.push('/product-costs')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">
              {id === 'new' ? 'New Product Cost' : 'Edit Product Cost'}
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
              <DollarSign className="h-5 w-5" />
              Product Cost Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="product_id">Product *</Label>
                  <Select value={formData.product_id} onValueChange={(value) => setFormData({ ...formData, product_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} ({product.part_no})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="month">Month (YYYY-MM) *</Label>
                  <Input
                    id="month"
                    type="month"
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="unit_cost">Unit Cost *</Label>
                  <Input
                    id="unit_cost"
                    type="number"
                    step="0.01"
                    value={formData.unit_cost}
                    onChange={(e) => setFormData({ ...formData, unit_cost: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => router.push('/product-costs')}>
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