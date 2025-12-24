'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InventorySummary from '@/components/reports/InventorySummary';
import CustomerSummary from '@/components/reports/CustomerSummary';
import StockMovement from '@/components/reports/StockMovement';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('inventory');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Reports</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="inventory">Inventory Summary</TabsTrigger>
            <TabsTrigger value="customers">Customer Summary</TabsTrigger>
            <TabsTrigger value="movement">Stock Movement</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="mt-6">
            <InventorySummary />
          </TabsContent>

          <TabsContent value="customers" className="mt-6">
            <CustomerSummary />
          </TabsContent>

          <TabsContent value="movement" className="mt-6">
            <StockMovement />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}