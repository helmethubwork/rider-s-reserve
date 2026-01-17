/**
 * Admin Return Requests Page
 * 
 * Displays all return/exchange requests submitted by customers.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import AdminLayout from './AdminLayout';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReturnRequest {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  order_number: string;
  product_type: string;
  original_product: string;
  product_color: string;
  size_ordered: string;
  size_needed: string;
  alternate_products: string | null;
  created_at: string;
}

const AdminReturnRequests = () => {
  const { data: requests, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['return-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('return_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ReturnRequest[];
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Return Requests</h1>
            <p className="text-muted-foreground">
              View and manage customer exchange/return requests
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : requests && requests.length > 0 ? (
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Order #</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Size Change</TableHead>
                    <TableHead>Alternate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(request.created_at), 'dd MMM yyyy')}
                        <br />
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(request.created_at), 'hh:mm a')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{request.full_name}</div>
                        <div className="text-sm text-muted-foreground">{request.email}</div>
                        <div className="text-sm text-muted-foreground">{request.phone}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{request.order_number}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{request.original_product}</div>
                        <div className="text-sm text-muted-foreground">
                          {request.product_type} • {request.product_color}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{request.size_ordered}</Badge>
                          <span>→</span>
                          <Badge variant="default">{request.size_needed}</Badge>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <span className="text-sm text-muted-foreground">
                          {request.alternate_products || '-'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-lg border border-border p-12 text-center">
            <RefreshCw className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No requests yet</h3>
            <p className="text-muted-foreground">
              Return/exchange requests will appear here when customers submit them.
            </p>
          </div>
        )}

        {requests && requests.length > 0 && (
          <p className="text-sm text-muted-foreground text-center">
            Showing {requests.length} request{requests.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminReturnRequests;
