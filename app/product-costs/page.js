'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, Plus, Search, Edit, Trash2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { toast } from 'sonner';

export default function ProductCostsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [productCosts, setProductCosts] = useState([]);
  const [filteredCosts, setFilteredCosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProductCosts();
  }, []);

  useEffect(() => {
    const filtered = productCosts.filter(cost => {
      const searchLower = (searchTerm || '').toLowerCase();
      return (
        (cost.product_name || '').toLowerCase().includes(searchLower) ||
        (cost.part_no || '').toLowerCase().includes(searchLower) ||
        (cost.month || '').toLowerCase().includes(searchLower) ||
        (cost.unit_cost || '').toString().toLowerCase().includes(searchLower)
      );
    });
    setFilteredCosts(filtered);
  }, [searchTerm, productCosts]);

  const fetchProductCosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/product-costs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setProductCosts(data.data || []);
        setFilteredCosts(data.data || []);
      } else {
        throw new Error(data.error || 'Failed to fetch product costs');
      }
    } catch (err) {
      console.error('Error fetching product costs:', err);
      setError(err.message);
      toast.error('Failed to load product costs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product cost record?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/product-costs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Product cost deleted successfully');
        fetchProductCosts();
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-96" />
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

  const totalCosts = productCosts.reduce((sum, cost) => sum + parseFloat(cost.unit_cost || 0), 0);
  const uniqueProducts = new Set(productCosts.map(cost => cost.product_id)).size;
  const latestMonth = productCosts.length > 0 ? productCosts[0].month : 'N/A';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Product Costs</h1>
          <Button onClick={() => router.push('/product-costs/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product Cost
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Records</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{productCosts.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Products</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{uniqueProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Latest Month</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{latestMonth}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Product Cost Records</CardTitle>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by product, month, or cost..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            {filteredCosts.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No product costs found</p>
                <Button onClick={() => router.push('/product-costs/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Product Cost
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Product</th>
                      <th className="text-left p-4">Month</th>
                      <th className="text-left p-4">Unit Cost</th>
                      <th className="text-right p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCosts.map((cost) => (
                      <tr key={cost.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">{cost.product_name || 'Unknown'} ({cost.part_no || 'N/A'})</td>
                        <td className="p-4">{cost.month}</td>
                        <td className="p-4">${parseFloat(cost.unit_cost).toFixed(2)}</td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/product-costs/${cost.id}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(cost.id)}
                            >
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
      </div>
    </DashboardLayout>
  );
}