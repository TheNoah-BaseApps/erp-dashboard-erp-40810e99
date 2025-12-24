'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/calculations';
import DataTable from '@/components/shared/DataTable';

export default function AuditLogViewer({ filters = {} }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`/api/audit-logs?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setLogs(data.data || []);
      } else {
        throw new Error(data.error || 'Failed to fetch audit logs');
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const columns = [
    {
      header: 'Timestamp',
      accessor: 'timestamp',
      cell: (row) => formatDateTime(row.timestamp)
    },
    {
      header: 'User',
      accessor: 'user_name',
      cell: (row) => row.user_name || row.user_email
    },
    {
      header: 'Action',
      accessor: 'action',
      cell: (row) => <Badge variant="outline">{row.action}</Badge>
    },
    {
      header: 'Entity Type',
      accessor: 'entity_type'
    },
    {
      header: 'Changes',
      accessor: 'changes',
      cell: (row) => (
        <span className="text-xs text-gray-600">
          {row.changes ? Object.keys(row.changes).join(', ') : 'N/A'}
        </span>
      )
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Logs</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={logs} />
      </CardContent>
    </Card>
  );
}