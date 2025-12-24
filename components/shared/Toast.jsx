'use client';

import { useEffect } from 'react';
import { toast as sonnerToast } from 'sonner';

export function showToast(message, type = 'success') {
  if (type === 'success') {
    sonnerToast.success(message);
  } else if (type === 'error') {
    sonnerToast.error(message);
  } else {
    sonnerToast(message);
  }
}

export default function Toast() {
  return null;
}