'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { validateProductData } from '@/lib/validation';

export default function ProductForm({ product, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    product_name: product?.product_name || '',
    product_code: product?.product_code || '',
    product_category: product?.product_category || '',
    unit: product?.unit || '',
    critical_stock_level: product?.critical_stock_level || '',
    brand: product?.brand || ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    const validation = validateProductData(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const url = product ? `/api/products/${product.id}` : '/api/products';
      const method = product ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save product');
      }

      if (data.success) {
        onSuccess();
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error saving product:', error);
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
          <Label htmlFor="product_code">Product Code *</Label>
          <Input
            id="product_code"
            name="product_code"
            value={formData.product_code}
            onChange={handleChange}
            disabled={loading}
          />
          {errors.product_code && (
            <p className="text-sm text-red-600">{errors.product_code}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="product_name">Product Name *</Label>
          <Input
            id="product_name"
            name="product_name"
            value={formData.product_name}
            onChange={handleChange}
            disabled={loading}
          />
          {errors.product_name && (
            <p className="text-sm text-red-600">{errors.product_name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="product_category">Category *</Label>
          <Input
            id="product_category"
            name="product_category"
            value={formData.product_category}
            onChange={handleChange}
            disabled={loading}
          />
          {errors.product_category && (
            <p className="text-sm text-red-600">{errors.product_category}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="brand">Brand</Label>
          <Input
            id="brand"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit">Unit *</Label>
          <Input
            id="unit"
            name="unit"
            placeholder="e.g., kg, pcs, liters"
            value={formData.unit}
            onChange={handleChange}
            disabled={loading}
          />
          {errors.unit && (
            <p className="text-sm text-red-600">{errors.unit}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="critical_stock_level">Critical Stock Level *</Label>
          <Input
            id="critical_stock_level"
            name="critical_stock_level"
            type="number"
            step="0.01"
            value={formData.critical_stock_level}
            onChange={handleChange}
            disabled={loading}
          />
          {errors.critical_stock_level && (
            <p className="text-sm text-red-600">{errors.critical_stock_level}</p>
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
            product ? 'Update Product' : 'Create Product'
          )}
        </Button>
      </div>
    </form>
  );
}