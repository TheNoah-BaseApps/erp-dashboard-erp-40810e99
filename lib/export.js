export async function exportToCSV(data, filename) {
  try {
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }
    
    const headers = Object.keys(data[0]);
    const csvRows = [];
    
    csvRows.push(headers.join(','));
    
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        const escaped = ('' + value).replace(/"/g, '\\"');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    throw error;
  }
}

export async function exportToJSON(data, filename) {
  try {
    if (!data) {
      throw new Error('No data to export');
    }
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error('Error exporting to JSON:', error);
    throw error;
  }
}

export function prepareProductsForExport(products) {
  return products.map(product => ({
    'Product Code': product.product_code,
    'Product Name': product.product_name,
    'Category': product.product_category,
    'Brand': product.brand,
    'Unit': product.unit,
    'Critical Stock Level': product.critical_stock_level,
    'Created At': new Date(product.created_at).toLocaleDateString()
  }));
}

export function prepareCustomersForExport(customers) {
  return customers.map(customer => ({
    'Customer Code': customer.customer_code,
    'Customer Name': customer.customer_name,
    'Contact Person': customer.contact_person,
    'Email': customer.email,
    'Phone': customer.telephone_number,
    'City': customer.city_or_district,
    'Region': customer.region_or_state,
    'Country': customer.country,
    'Sales Rep': customer.sales_rep,
    'Payment Terms Limit': customer.payment_terms_limit,
    'Balance Risk Limit': customer.balance_risk_limit
  }));
}

export function prepareStockForExport(stockRecords) {
  return stockRecords.map(stock => ({
    'Product': stock.product_name || '',
    'Part Number': stock.part_number,
    'Warehouse Location': stock.warehouse_location,
    'Current Amount': stock.current_amount,
    'Unit': stock.unit,
    'Consumption Rate': stock.consumption_rate,
    'Estimated Stock Days': stock.estimated_stock_days,
    'Critical Level Days': stock.critical_level_days,
    'First Sales Date': stock.first_sales_date ? new Date(stock.first_sales_date).toLocaleDateString() : '',
    'Expiry Date': stock.expiry_date ? new Date(stock.expiry_date).toLocaleDateString() : ''
  }));
}

export function prepareAuditLogsForExport(logs) {
  return logs.map(log => ({
    'Timestamp': new Date(log.timestamp).toLocaleString(),
    'User': log.user_name || log.user_email,
    'Action': log.action,
    'Entity Type': log.entity_type,
    'Entity ID': log.entity_id,
    'Changes': JSON.stringify(log.changes)
  }));
}