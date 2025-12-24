'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { validateCustomerData } from '@/lib/validation';

export default function CustomerForm({ customer, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    customer_name: customer?.customer_name || '',
    customer_code: customer?.customer_code || '',
    address: customer?.address || '',
    city_or_district: customer?.city_or_district || '',
    region_or_state: customer?.region_or_state || '',
    country: customer?.country || '',
    telephone_number: customer?.telephone_number || '',
    email: customer?.email || '',
    contact_person: customer?.contact_person || '',
    sales_rep: customer?.sales_rep || '',
    payment_terms_limit: customer?.payment_terms_limit || '',
    balance_risk_limit: customer?.balance_risk_limit || ''
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
    
    const validation = validateCustomerData(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const url = customer ? `/api/customers/${customer.id}` : '/api/customers';
      const method = customer ? 'PUT' : 'POST';
      
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
        throw new Error(data.error || 'Failed to save customer');
      }

      if (data.success) {
        onSuccess();
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error saving customer:', error);
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
          <Label htmlFor="customer_code">Customer Code *</Label>
          <Input
            id="customer_code"
            name="customer_code"
            value={formData.customer_code}
            onChange={handleChange}
            disabled={loading}
          />
          {errors.customer_code && (
            <p className="text-sm text-red-600">{errors.customer_code}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="customer_name">Customer Name *</Label>
          <Input
            id="customer_name"
            name="customer_name"
            value={formData.customer_name}
            onChange={handleChange}
            disabled={loading}
          />
          {errors.customer_name && (
            <p className="text-sm text-red-600">{errors.customer_name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact_person">Contact Person</Label>
          <Input
            id="contact_person"
            name="contact_person"
            value={formData.contact_person}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sales_rep">Sales Representative *</Label>
          <Input
            id="sales_rep"
            name="sales_rep"
            value={formData.sales_rep}
            onChange={handleChange}
            disabled={loading}
          />
          {errors.sales_rep && (
            <p className="text-sm text-red-600">{errors.sales_rep}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="telephone_number">Phone Number</Label>
          <Input
            id="telephone_number"
            name="telephone_number"
            value={formData.telephone_number}
            onChange={handleChange}
            disabled={loading}
          />
          {errors.telephone_number && (
            <p className="text-sm text-red-600">{errors.telephone_number}</p>
          )}
        </div>

        <div className="space-y-2 col-span-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            disabled={loading}
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city_or_district">City/District</Label>
          <Input
            id="city_or_district"
            name="city_or_district"
            value={formData.city_or_district}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="region_or_state">Region/State</Label>
          <Input
            id="region_or_state"
            name="region_or_state"
            value={formData.region_or_state}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="payment_terms_limit">Payment Terms Limit *</Label>
          <Input
            id="payment_terms_limit"
            name="payment_terms_limit"
            type="number"
            step="0.01"
            value={formData.payment_terms_limit}
            onChange={handleChange}
            disabled={loading}
          />
          {errors.payment_terms_limit && (
            <p className="text-sm text-red-600">{errors.payment_terms_limit}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="balance_risk_limit">Balance Risk Limit *</Label>
          <Input
            id="balance_risk_limit"
            name="balance_risk_limit"
            type="number"
            step="0.01"
            value={formData.balance_risk_limit}
            onChange={handleChange}
            disabled={loading}
          />
          {errors.balance_risk_limit && (
            <p className="text-sm text-red-600">{errors.balance_risk_limit}</p>
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
            customer ? 'Update Customer' : 'Create Customer'
          )}
        </Button>
      </div>
    </form>
  );
}