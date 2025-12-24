'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MetricCard from './MetricCard';
import RecentActivities from './RecentActivities';

export default function DashboardHome() {
  const [metrics, setMetrics] = useState({
    totalProducts: 0,
    totalCustomers: 0,
    criticalStock: 0,
    expiringItems: 0
  });

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const [productsRes, customersRes, criticalRes, alertsRes] = await Promise.all([
        fetch('/api/products', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/customers', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/products/critical-stock', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/stock-records/alerts', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const [products, customers, critical, alerts] = await Promise.all([
        productsRes.json(),
        customersRes.json(),
        criticalRes.json(),
        alertsRes.json()
      ]);

      setMetrics({
        totalProducts: products.data?.length || 0,
        totalCustomers: customers.data?.length || 0,
        criticalStock: critical.data?.length || 0,
        expiringItems: alerts.data?.expiring?.length || 0
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Products"
          value={metrics.totalProducts}
          description="Active products in catalog"
        />
        <MetricCard
          title="Total Customers"
          value={metrics.totalCustomers}
          description="Registered customers"
        />
        <MetricCard
          title="Critical Stock"
          value={metrics.criticalStock}
          description="Items below critical level"
          variant="error"
        />
        <MetricCard
          title="Expiring Soon"
          value={metrics.expiringItems}
          description="Items expiring in 30 days"
          variant="warning"
        />
      </div>

      <RecentActivities />
    </div>
  );
}