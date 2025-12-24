'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tag, Plus, Search, Edit, Trash2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { toast } from 'sonner';

export default function SalesPricesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [salesPrices, setSalesPrices] = useState([]);
  const [filteredPrices, setFilteredPrices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchSalesPrices();
  }, []);

  useEffect(() => {
    const filtered = salesPrices.filter(price => {
      const product = products.find(p => p.id === price.product_id);
      const productName = product ? product.name : '';
      return (
        productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        price.month.toLowerCase().includes(searchTerm.toLowerCase()) ||
        price.sales_price.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    setFilteredPrices(filtered);
  }, [searchTerm, salesPrices, products]);

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

  const fetchSalesPrices = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/sales-prices', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSalesPrices(data.data || []);
        setFilteredPrices(data.data || []);
      } else {
        throw new Error(data.error || 'Failed to fetch sales prices');
      }
    } catch (err) {
      console.error('Error fetching sales prices:', err);
      setError(err.message);
      toast.error('Failed to load sales prices');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this sales price record?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/sales-prices/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Sales price deleted successfully');
        fetchSalesPrices();
      } else {
        throw new Error(data.error || 'Failed to delete sales price');
      }
    } catch (err) {
      console.error('Error deleting sales price:', err);
      toast.error(err.message);
    }
  };

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? `${product.name} (${product.part_no})` : 'Unknown Product';
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

  const uniqueProducts = new Set(salesPrices.map(price => price.product_id)).size;
  const latestMonth = salesPrices.length > 0 ? salesPrices[0].month : 'N/A';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Sales Prices</h1>
          <Button onClick={() => router.push('/sales-prices/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Sales Price
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Records</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{salesPrices.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Products</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{uniqueProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Latest Month</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{latestMonth}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sales Price Records</CardTitle>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by product, month, or price..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            {filteredPrices.length === 0 ? (
              <div className="text-center py-12">
                <Tag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No sales prices found</p>
                <Button onClick={() => router.push('/sales-prices/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Sales Price
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Product</th>
                      <th className="text-left p-4">Month</th>
                      <th className="text-left p-4">Sales Price</th>
                      <th className="text-right p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPrices.map((price) => (
                      <tr key={price.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">{getProductName(price.product_id)}</td>
                        <td className="p-4">{price.month}</td>
                        <td className="p-4">${parseFloat(price.sales_price).toFixed(2)}</td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/sales-prices/${price.id}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(price.id)}
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