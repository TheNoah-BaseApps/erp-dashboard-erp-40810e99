'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, Users, AlertTriangle, Calendar } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [productsRes, customersRes, criticalStockRes, alertsRes] = await Promise.all([
        fetch('/api/products', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/customers', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/products/critical-stock', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/stock-records/alerts', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const [products, customers, criticalStock, alerts] = await Promise.all([
        productsRes.json(),
        customersRes.json(),
        criticalStockRes.json(),
        alertsRes.json()
      ]);

      setStats({
        totalProducts: products.data?.length || 0,
        totalCustomers: customers.data?.length || 0,
        criticalStock: criticalStock.data?.length || 0,
        expiringItems: alerts.data?.expiring?.length || 0
      });
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4 rounded" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
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
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
              <p className="text-xs text-muted-foreground">Active products in catalog</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalCustomers || 0}</div>
              <p className="text-xs text-muted-foreground">Registered customers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats?.criticalStock || 0}</div>
              <p className="text-xs text-muted-foreground">Items below critical level</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
              <Calendar className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats?.expiringItems || 0}</div>
              <p className="text-xs text-muted-foreground">Items expiring in 30 days</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a href="/products" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <h3 className="font-semibold mb-1">Manage Products</h3>
                <p className="text-sm text-gray-600">View and edit product catalog</p>
              </a>
              <a href="/customers" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <h3 className="font-semibold mb-1">Manage Customers</h3>
                <p className="text-sm text-gray-600">View and edit customer records</p>
              </a>
              <a href="/stock" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <h3 className="font-semibold mb-1">Manage Stock</h3>
                <p className="text-sm text-gray-600">Track inventory levels</p>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}