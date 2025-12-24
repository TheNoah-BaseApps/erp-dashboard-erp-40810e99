'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { validateStockRecordData } from '@/lib/validation';
import { calculateEstimatedStockDays } from '@/lib/calculations';

export default function StockForm({ stockRecord, onSuccess, onCancel }) {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    product_id: stockRecord?.product_id || '',
    part_number: stockRecord?.part_number || '',
    warehouse_location: stockRecord?.warehouse_location || '',
    current_amount: stockRecord?.current_amount || '',
    unit: stockRecord?.unit || '',
    first_sales_date: stockRecord?.first_sales_date || '',
    expiry_date: stockRecord?.expiry_date || '',
    consumption_rate: stockRecord?.consumption_rate || '',
    critical_level_days: stockRecord?.critical_level_days || ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setProducts(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleProductChange = (value) => {
    const product = products.find(p => p.id === value);
    setFormData(prev => ({
      ...prev,
      product_id: value,
      unit: product?.unit || prev.unit
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    const validation = validateStockRecordData(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const estimatedStockDays = calculateEstimatedStockDays(
        parseFloat(formData.current_amount),
        parseFloat(formData.consumption_rate)
      );

      const payload = {
        ...formData,
        estimated_stock_days: estimatedStockDays
      };

      const url = stockRecord ? `/api/stock-records/${stockRecord.id}` : '/api/stock-records';
      const method = stockRecord ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save stock record');
      }

      if (data.success) {
        onSuccess();
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error saving stock record:', error);
      setApiError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {apiError && (
        <Alert variant="destructive">
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="product_id">Product *</Label>
          <Select value={formData.product_id} onValueChange={handleProductChange} disabled={loading}>
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
          {errors.product_id && (
            <p className="text-sm text-red-600">{errors.product_id}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="part_number">Part Number *</Label>
          <Input
            id="part_number"
            name="part_number"
            value={formData.part_number}
            onChange={handleChange}
            disabled={loading}
          />
          {errors.part_number && (
            <p className="text-sm text-red-600">{errors.part_number}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="warehouse_location">Warehouse Location *</Label>
          <Input
            id="warehouse_location"
            name="warehouse_location"
            value={formData.warehouse_location}
            onChange={handleChange}
            disabled={loading}
          />
          {errors.warehouse_location && (
            <p className="text-sm text-red-600">{errors.warehouse_location}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="current_amount">Current Amount *</Label>
          <Input
            id="current_amount"
            name="current_amount"
            type="number"
            step="0.01"
            value={formData.current_amount}
            onChange={handleChange}
            disabled={loading}
          />
          {errors.current_amount && (
            <p className="text-sm text-red-600">{errors.current_amount}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit">Unit *</Label>
          <Input
            id="unit"
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            disabled={loading}
          />
          {errors.unit && (
            <p className="text-sm text-red-600">{errors.unit}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="consumption_rate">Consumption Rate (per day)</Label>
          <Input
            id="consumption_rate"
            name="consumption_rate"
            type="number"
            step="0.01"
            value={formData.consumption_rate}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="critical_level_days">Critical Level Days *</Label>
          <Input
            id="critical_level_days"
            name="critical_level_days"
            type="number"
            step="0.01"
            value={formData.critical_level_days}
            onChange={handleChange}
            disabled={loading}
          />
          {errors.critical_level_days && (
            <p className="text-sm text-red-600">{errors.critical_level_days}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="first_sales_date">First Sales Date</Label>
          <Input
            id="first_sales_date"
            name="first_sales_date"
            type="date"
            value={formData.first_sales_date}
            onChange={handleChange}
            disabled={loading}
          />
          {errors.first_sales_date && (
            <p className="text-sm text-red-600">{errors.first_sales_date}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="expiry_date">Expiry Date</Label>
          <Input
            id="expiry_date"
            name="expiry_date"
            type="date"
            value={formData.expiry_date}
            onChange={handleChange}
            disabled={loading}
          />
          {errors.expiry_date && (
            <p className="text-sm text-red-600">{errors.expiry_date}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            stockRecord ? 'Update Stock Record' : 'Create Stock Record'
          )}
        </Button>
      </div>
    </form>
  );
}