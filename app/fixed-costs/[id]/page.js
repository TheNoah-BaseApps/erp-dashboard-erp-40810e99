'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Save, Trash2, Wallet } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { toast } from 'sonner';

export default function FixedCostEditPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    cost_name: '',
    month: '',
    amount: ''
  });

  useEffect(() => {
    if (id !== 'new') {
      fetchFixedCost();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchFixedCost = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/fixed-costs/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const record = data.data;
        setFormData({
          cost_name: record.cost_name || '',
          month: record.month || '',
          amount: record.amount || ''
        });
      } else {
        throw new Error(data.error || 'Failed to fetch fixed cost');
      }
    } catch (err) {
      console.error('Error fetching fixed cost:', err);
      setError(err.message);
      toast.error('Failed to load fixed cost');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const url = id === 'new' ? '/api/fixed-costs' : `/api/fixed-costs/${id}`;
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
        toast.success(id === 'new' ? 'Fixed cost created' : 'Fixed cost updated');
        router.push('/fixed-costs');
      } else {
        throw new Error(data.error || 'Failed to save fixed cost');
      }
    } catch (err) {
      console.error('Error saving fixed cost:', err);
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this fixed cost record?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/fixed-costs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Fixed cost deleted');
        router.push('/fixed-costs');
      } else {
        throw new Error(data.error || 'Failed to delete fixed cost');
      }
    } catch (err) {
      console.error('Error deleting fixed cost:', err);
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
            <Button variant="outline" onClick={() => router.push('/fixed-costs')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">
              {id === 'new' ? 'New Fixed Cost' : 'Edit Fixed Cost'}
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
              <Wallet className="h-5 w-5" />
              Fixed Cost Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cost_name">Cost Name *</Label>
                  <Input
                    id="cost_name"
                    value={formData.cost_name}
                    onChange={(e) => setFormData({ ...formData, cost_name: e.target.value })}
                    required
                  />
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
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => router.push('/fixed-costs')}>
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