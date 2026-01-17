/**
 * Admin Return Requests Page
 * 
 * Displays all return/exchange requests submitted by customers.
 */

import { useState } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Loader2, RefreshCw, Eye } from 'lucide-react';
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
  const [selectedRequest, setSelectedRequest] = useState<ReturnRequest | null>(null);

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
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(request.created_at), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{request.full_name}</div>
                        <div className="text-sm text-muted-foreground">{request.email}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{request.order_number}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{request.original_product}</div>
                        <div className="text-sm text-muted-foreground">{request.product_type}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{request.size_ordered}</Badge>
                          <span>→</span>
                          <Badge variant="default">{request.size_needed}</Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedRequest(request)}
                          title="View details"
                        >
                          <Eye size={18} />
                        </Button>
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

        {/* Request Detail Dialog */}
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Return Request Details</DialogTitle>
              <DialogDescription>
                Order #{selectedRequest?.order_number} • Submitted on{' '}
                {selectedRequest?.created_at &&
                  format(new Date(selectedRequest.created_at), 'MMMM d, yyyy h:mm a')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Customer Name</p>
                  <p className="font-medium">{selectedRequest?.full_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedRequest?.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedRequest?.phone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Product Type</p>
                  <p className="font-medium">{selectedRequest?.product_type}</p>
                </div>
              </div>

              <div>
                <p className="text-muted-foreground text-sm mb-2">Product Details</p>
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Product:</span>
                    <span className="font-medium">{selectedRequest?.original_product}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Color:</span>
                    <span className="font-medium">{selectedRequest?.product_color}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Size Ordered:</span>
                    <Badge variant="secondary">{selectedRequest?.size_ordered}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Size Needed:</span>
                    <Badge variant="default">{selectedRequest?.size_needed}</Badge>
                  </div>
                </div>
              </div>

              {selectedRequest?.alternate_products && (
                <div>
                  <p className="text-muted-foreground text-sm mb-2">Alternate Products</p>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="whitespace-pre-wrap">{selectedRequest.alternate_products}</p>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminReturnRequests;
