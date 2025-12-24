export function validateEmail(email) {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhoneNumber(phone) {
  if (!phone) return false;
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 7;
}

export function validateProductCode(code) {
  if (!code) return false;
  return code.trim().length >= 2 && code.trim().length <= 50;
}

export function validateCustomerCode(code) {
  if (!code) return false;
  return code.trim().length >= 2 && code.trim().length <= 50;
}

export function validatePositiveNumber(value) {
  const num = parseFloat(value);
  return !isNaN(num) && num >= 0;
}

export function validateFutureDate(date) {
  if (!date) return false;
  const inputDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return inputDate > today;
}

export function validatePastOrTodayDate(date) {
  if (!date) return false;
  const inputDate = new Date(date);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return inputDate <= today;
}

export function validateProductData(data) {
  const errors = {};
  
  if (!data.product_name?.trim()) {
    errors.product_name = 'Product name is required';
  }
  
  if (!validateProductCode(data.product_code)) {
    errors.product_code = 'Valid product code is required (2-50 characters)';
  }
  
  if (!data.product_category?.trim()) {
    errors.product_category = 'Product category is required';
  }
  
  if (!data.unit?.trim()) {
    errors.unit = 'Unit is required';
  }
  
  if (!validatePositiveNumber(data.critical_stock_level)) {
    errors.critical_stock_level = 'Critical stock level must be a positive number';
  }
  
  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateCustomerData(data) {
  const errors = {};
  
  if (!data.customer_name?.trim()) {
    errors.customer_name = 'Customer name is required';
  }
  
  if (!validateCustomerCode(data.customer_code)) {
    errors.customer_code = 'Valid customer code is required (2-50 characters)';
  }
  
  if (!data.sales_rep?.trim()) {
    errors.sales_rep = 'Sales representative is required';
  }
  
  if (data.email && !validateEmail(data.email)) {
    errors.email = 'Invalid email format';
  }
  
  if (data.telephone_number && !validatePhoneNumber(data.telephone_number)) {
    errors.telephone_number = 'Invalid phone number format';
  }
  
  if (!validatePositiveNumber(data.payment_terms_limit)) {
    errors.payment_terms_limit = 'Payment terms limit must be non-negative';
  }
  
  if (!validatePositiveNumber(data.balance_risk_limit)) {
    errors.balance_risk_limit = 'Balance risk limit must be non-negative';
  }
  
  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateStockRecordData(data) {
  const errors = {};
  
  if (!data.product_id) {
    errors.product_id = 'Product is required';
  }
  
  if (!data.part_number?.trim()) {
    errors.part_number = 'Part number is required';
  }
  
  if (!data.warehouse_location?.trim()) {
    errors.warehouse_location = 'Warehouse location is required';
  }
  
  if (!validatePositiveNumber(data.current_amount)) {
    errors.current_amount = 'Current amount must be non-negative';
  }
  
  if (!data.unit?.trim()) {
    errors.unit = 'Unit is required';
  }
  
  if (data.first_sales_date && !validatePastOrTodayDate(data.first_sales_date)) {
    errors.first_sales_date = 'First sales date cannot be in the future';
  }
  
  if (data.expiry_date && !validateFutureDate(data.expiry_date)) {
    errors.expiry_date = 'Expiry date must be in the future';
  }
  
  if (!validatePositiveNumber(data.critical_level_days)) {
    errors.critical_level_days = 'Critical level days must be non-negative';
  }
  
  return { isValid: Object.keys(errors).length === 0, errors };
}