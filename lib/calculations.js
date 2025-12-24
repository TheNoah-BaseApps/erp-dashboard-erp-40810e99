export function calculateConsumptionRate(currentAmount, estimatedStockDays) {
  if (!estimatedStockDays || estimatedStockDays <= 0) {
    return 0;
  }
  return currentAmount / estimatedStockDays;
}

export function calculateEstimatedStockDays(currentAmount, consumptionRate) {
  if (!consumptionRate || consumptionRate <= 0) {
    return 0;
  }
  return currentAmount / consumptionRate;
}

export function isStockCritical(estimatedStockDays, criticalLevelDays) {
  if (!estimatedStockDays || !criticalLevelDays) {
    return false;
  }
  return estimatedStockDays <= criticalLevelDays;
}

export function getDaysUntilExpiry(expiryDate) {
  if (!expiryDate) return null;
  
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

export function isExpiryWarning(expiryDate, warningDays = 30) {
  const daysUntilExpiry = getDaysUntilExpiry(expiryDate);
  if (daysUntilExpiry === null) return false;
  
  return daysUntilExpiry <= warningDays && daysUntilExpiry > 0;
}

export function isExpired(expiryDate) {
  const daysUntilExpiry = getDaysUntilExpiry(expiryDate);
  return daysUntilExpiry !== null && daysUntilExpiry < 0;
}

export function calculateStockValue(quantity, unitPrice) {
  return quantity * unitPrice;
}

export function getStockStatus(currentAmount, criticalStockLevel) {
  if (currentAmount <= 0) {
    return 'out_of_stock';
  } else if (currentAmount <= criticalStockLevel) {
    return 'critical';
  } else if (currentAmount <= criticalStockLevel * 1.5) {
    return 'low';
  } else {
    return 'adequate';
  }
}

export function calculateCustomerRiskLevel(balance, balanceRiskLimit) {
  if (!balanceRiskLimit || balanceRiskLimit === 0) {
    return 'unknown';
  }
  
  const percentage = (balance / balanceRiskLimit) * 100;
  
  if (percentage >= 100) {
    return 'high';
  } else if (percentage >= 80) {
    return 'medium';
  } else {
    return 'low';
  }
}

export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

export function formatNumber(number, decimals = 2) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(number);
}

export function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function formatDateTime(date) {
  if (!date) return '';
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}