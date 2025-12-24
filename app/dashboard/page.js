'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, Users, AlertTriangle, Calendar, FileText, TrendingUp, Target, DollarSign, Wallet, Tag } from 'lucide-react';
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
      
      const [productsRes, customersRes, criticalStockRes, alertsRes, salesRecordsRes, actualSalesRes, salesTargetsRes, productCostsRes, fixedCostsRes, salesPricesRes] = await Promise.all([
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
        }),
        fetch('/api/sales-records', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/actual-sales', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/sales-targets', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/product-costs', {
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => ({ json: async () => ({ data: [] }) })),
        fetch('/api/fixed-costs', {
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => ({ json: async () => ({ data: [] }) })),
        fetch('/api/sales-prices', {
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => ({ json: async () => ({ data: [] }) }))
      ]);

      const [products, customers, criticalStock, alerts, salesRecords, actualSales, salesTargets, productCosts, fixedCosts, salesPrices] = await Promise.all([
        productsRes.json(),
        customersRes.json(),
        criticalStockRes.json(),
        alertsRes.json(),
        salesRecordsRes.json(),
        actualSalesRes.json(),
        salesTargetsRes.json(),
        productCostsRes.json(),
        fixedCostsRes.json(),
        salesPricesRes.json()
      ]);

      setStats({
        totalProducts: products.data?.length || 0,
        totalCustomers: customers.data?.length || 0,
        criticalStock: criticalStock.data?.length || 0,
        expiringItems: alerts.data?.expiring?.length || 0,
        totalSalesRecords: salesRecords.data?.length || 0,
        totalActualSales: actualSales.data?.length || 0,
        totalSalesTargets: salesTargets.data?.length || 0,
        totalProductCosts: productCosts.data?.length || 0,
        totalFixedCosts: fixedCosts.data?.length || 0,
        totalSalesPrices: salesPrices.data?.length || 0
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

        <Card>
          <CardHeader>
            <CardTitle>Sales Workflows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a href="/sales-records" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold">Sales Records</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">Manage invoice records, products, and customer sales</p>
                <div className="text-2xl font-bold text-blue-600">{stats?.totalSalesRecords || 0}</div>
                <p className="text-xs text-muted-foreground">Total sales records</p>
              </a>
              
              <a href="/actual-sales" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold">Actual Sales</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">Track actual sales amounts by product and month</p>
                <div className="text-2xl font-bold text-green-600">{stats?.totalActualSales || 0}</div>
                <p className="text-xs text-muted-foreground">Actual sales entries</p>
              </a>
              
              <a href="/sales-targets" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold">Sales Targets</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">Set and manage monthly sales targets by product</p>
                <div className="text-2xl font-bold text-purple-600">{stats?.totalSalesTargets || 0}</div>
                <p className="text-xs text-muted-foreground">Sales targets set</p>
              </a>

              <a href="/product-costs" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="h-5 w-5 text-amber-600" />
                  <h3 className="font-semibold">Product Costs</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">Track unit costs by product and month</p>
                <div className="text-2xl font-bold text-amber-600">{stats?.totalProductCosts || 0}</div>
                <p className="text-xs text-muted-foreground">Product cost records</p>
              </a>

              <a href="/fixed-costs" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <Wallet className="h-5 w-5 text-indigo-600" />
                  <h3 className="font-semibold">Fixed Costs</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">Manage fixed operational costs by month</p>
                <div className="text-2xl font-bold text-indigo-600">{stats?.totalFixedCosts || 0}</div>
                <p className="text-xs text-muted-foreground">Fixed cost records</p>
              </a>

              <a href="/sales-prices" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <Tag className="h-5 w-5 text-cyan-600" />
                  <h3 className="font-semibold">Sales Prices</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">Set and track sales prices by product and month</p>
                <div className="text-2xl font-bold text-cyan-600">{stats?.totalSalesPrices || 0}</div>
                <p className="text-xs text-muted-foreground">Sales price records</p>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}