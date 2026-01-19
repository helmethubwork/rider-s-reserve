/**
 * Admin Return Requests Page
 * 
 * Displays all return/exchange requests submitted by customers.
 * Marks requests as read when viewed.
 */

import { useState, useEffect } from 'react';
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
import { Loader2, RefreshCw, Eye, Circle } from 'lucide-react';
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

// Helper to manage read status in localStorage
const getReadItems = (key: string): string[] => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const markAsRead = (key: string, id: string) => {
  const items = getReadItems(key);
  if (!items.includes(id)) {
    items.push(id);
    localStorage.setItem(key, JSON.stringify(items));
  }
};

const AdminReturnRequests = () => {
  const [selectedRequest, setSelectedRequest] = useState<ReturnRequest | null>(null);
  const [readReturns, setReadReturns] = useState<string[]>([]);

  useEffect(() => {
    setReadReturns(getReadItems('admin_read_returns'));
  }, []);

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

  const handleViewRequest = (request: ReturnRequest) => {
    setSelectedRequest(request);
    if (!readReturns.includes(request.id)) {
      markAsRead('admin_read_returns', request.id);
      setReadReturns([...readReturns, request.id]);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Return Requests</h1>
            <p className="text-gray-600">
              View and manage customer exchange/return requests
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
          </div>
        ) : requests && requests.length > 0 ? (
          <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-100 border-b-2 border-gray-200">
                  <TableRow>
                    <TableHead className="font-bold text-gray-700">Date</TableHead>
                    <TableHead className="font-bold text-gray-700">Customer</TableHead>
                    <TableHead className="font-bold text-gray-700">Order #</TableHead>
                    <TableHead className="font-bold text-gray-700">Product</TableHead>
                    <TableHead className="font-bold text-gray-700">Size Change</TableHead>
                    <TableHead className="text-right font-bold text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => {
                    const isUnread = !readReturns.includes(request.id);
                    return (
                      <TableRow 
                        key={request.id} 
                        className={isUnread ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'}
                      >
                        <TableCell className="whitespace-nowrap text-gray-900">
                          <div className="flex items-center gap-2">
                            {isUnread && <Circle size={8} className="text-red-500 fill-red-500 flex-shrink-0" />}
                            {format(new Date(request.created_at), 'dd MMM yyyy')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-bold text-gray-900">{request.full_name}</div>
                          <div className="text-sm text-gray-500">{request.email}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-gray-300 text-gray-700 font-bold">{request.order_number}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-bold text-gray-900">{request.original_product}</div>
                          <div className="text-sm text-gray-500">{request.product_type}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-gray-200 text-gray-700 font-bold">{request.size_ordered}</Badge>
                            <span className="text-gray-500">→</span>
                            <Badge className="bg-yellow-500 text-gray-900 font-bold">{request.size_needed}</Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleViewRequest(request)}
                            title="View details"
                            className="border-gray-300 hover:bg-gray-100"
                          >
                            <Eye size={18} className="text-gray-700" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
          <DialogContent className="max-w-lg bg-white">
            <DialogHeader>
              <DialogTitle className="text-gray-900 text-xl font-bold">Return Request Details</DialogTitle>
              <DialogDescription className="text-gray-600">
                Order #{selectedRequest?.order_number} • Submitted on{' '}
                {selectedRequest?.created_at &&
                  format(new Date(selectedRequest.created_at), 'MMMM d, yyyy h:mm a')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 font-medium">Customer Name</p>
                  <p className="font-bold text-gray-900">{selectedRequest?.full_name}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Email</p>
                  <p className="font-bold text-gray-900">{selectedRequest?.email}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Phone</p>
                  <p className="font-bold text-gray-900">{selectedRequest?.phone}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Product Type</p>
                  <p className="font-bold text-gray-900">{selectedRequest?.product_type}</p>
                </div>
              </div>

              <div>
                <p className="text-gray-600 font-medium text-sm mb-2">Product Details</p>
                <div className="bg-gray-100 rounded-lg p-4 space-y-2 border border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Product:</span>
                    <span className="font-bold text-gray-900">{selectedRequest?.original_product}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Color:</span>
                    <span className="font-bold text-gray-900">{selectedRequest?.product_color}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Size Ordered:</span>
                    <Badge variant="secondary" className="bg-gray-200 text-gray-700 font-bold">{selectedRequest?.size_ordered}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Size Needed:</span>
                    <Badge className="bg-yellow-500 text-gray-900 font-bold">{selectedRequest?.size_needed}</Badge>
                  </div>
                </div>
              </div>

              {selectedRequest?.alternate_products && (
                <div>
                  <p className="text-gray-600 font-medium text-sm mb-2">Alternate Products</p>
                  <div className="bg-gray-100 rounded-lg p-4 border border-gray-200">
                    <p className="whitespace-pre-wrap text-gray-900">{selectedRequest.alternate_products}</p>
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
