'use client';

import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Calendar } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { toast } from 'sonner';
import { getDaysUntilExpiry } from '@/lib/calculations';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState({ lowStock: [], expiring: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/stock-records/alerts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setAlerts({
          lowStock: data.data?.lowStock || [],
          expiring: data.data?.expiring || []
        });
      } else {
        throw new Error(data.error || 'Failed to fetch alerts');
      }
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setError(err.message);
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Stock Alerts</h1>
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
        <h1 className="text-3xl font-bold">Stock Alerts</h1>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Low Stock Alerts ({alerts.lowStock.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {alerts.lowStock.length === 0 ? (
                <p className="text-sm text-gray-600">No low stock items</p>
              ) : (
                <div className="space-y-3">
                  {alerts.lowStock.map((item) => (
                    <div key={item.id} className="p-3 border rounded-lg bg-red-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{item.product_name}</p>
                          <p className="text-sm text-gray-600">Part: {item.part_number}</p>
                          <p className="text-sm text-gray-600">Location: {item.warehouse_location}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-red-600">
                            {item.current_amount} {item.unit}
                          </p>
                          <p className="text-xs text-gray-600">
                            {item.estimated_stock_days?.toFixed(1)} days left
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-orange-600" />
                Expiring Soon ({alerts.expiring.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {alerts.expiring.length === 0 ? (
                <p className="text-sm text-gray-600">No items expiring soon</p>
              ) : (
                <div className="space-y-3">
                  {alerts.expiring.map((item) => (
                    <div key={item.id} className="p-3 border rounded-lg bg-orange-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{item.product_name}</p>
                          <p className="text-sm text-gray-600">Part: {item.part_number}</p>
                          <p className="text-sm text-gray-600">Location: {item.warehouse_location}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-orange-600">
                            {getDaysUntilExpiry(item.expiry_date)} days
                          </p>
                          <p className="text-xs text-gray-600">
                            Expires: {new Date(item.expiry_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}