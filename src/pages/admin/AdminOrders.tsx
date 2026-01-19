/**
 * Admin Orders Page
 * 
 * Allows admins to view and manage orders:
 * - View all orders
 * - Update order status
 * - Add tracking information
 * Marks orders as read when viewed.
 */

import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Order, OrderItemDB } from '@/hooks/useOrders';
import { Eye, Loader2, Package, Truck, Circle } from 'lucide-react';
import { toast } from 'sonner';

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

const orderStatuses = [
  { value: 'placed', label: 'Placed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const AdminOrders = () => {
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [readOrders, setReadOrders] = useState<string[]>([]);

  useEffect(() => {
    setReadOrders(getReadItems('admin_read_orders'));
  }, []);

  // Edit form state
  const [editData, setEditData] = useState({
    order_status: '',
    tracking_id: '',
    courier_name: '',
  });

  // Fetch all orders
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Order[];
    },
  });

  // Fetch order items for selected order
  const { data: orderItems = [] } = useQuery({
    queryKey: ['admin', 'order_items', selectedOrder?.id],
    queryFn: async () => {
      if (!selectedOrder) return [];
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', selectedOrder.id);

      if (error) throw error;
      return data as OrderItemDB[];
    },
    enabled: !!selectedOrder,
  });

  // Update order mutation
  const updateOrder = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof editData }) => {
      const { error } = await supabase
        .from('orders')
        .update({
          order_status: data.order_status,
          tracking_id: data.tracking_id || null,
          courier_name: data.courier_name || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Order updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      setIsEditOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to update order: ' + error.message);
    },
  });

  // Format price
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Open details dialog and mark as read
  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
    if (!readOrders.includes(order.id)) {
      markAsRead('admin_read_orders', order.id);
      setReadOrders([...readOrders, order.id]);
    }
  };

  // Open edit dialog and mark as read
  const handleEdit = (order: Order) => {
    setSelectedOrder(order);
    setEditData({
      order_status: order.order_status,
      tracking_id: order.tracking_id || '',
      courier_name: order.courier_name || '',
    });
    setIsEditOpen(true);
    if (!readOrders.includes(order.id)) {
      markAsRead('admin_read_orders', order.id);
      setReadOrders([...readOrders, order.id]);
    }
  };


  // Handle edit submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOrder) {
      updateOrder.mutate({ id: selectedOrder.id, data: editData });
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'placed':
        return 'bg-gray-700 text-gray-200';
      case 'shipped':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'delivered':
        return 'bg-green-500/20 text-green-400';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  // Get payment status color
  const getPaymentColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500/20 text-green-400';
      case 'pending':
        return 'bg-orange-500/20 text-orange-400';
      case 'failed':
        return 'bg-red-500/20 text-red-400';
      case 'refunded':
        return 'bg-gray-700 text-gray-300';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600">Manage customer orders</p>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No orders yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-bold text-gray-700">
                      Order
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-bold text-gray-700">
                      Customer
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-bold text-gray-700">
                      Total
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-bold text-gray-700">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-bold text-gray-700">
                      Payment
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-bold text-gray-700">
                      Date
                    </th>
                    <th className="text-right px-4 py-3 text-sm font-bold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order) => {
                    const isUnread = !readOrders.includes(order.id);
                    return (
                      <tr 
                        key={order.id} 
                        className={isUnread ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {isUnread && <Circle size={8} className="text-red-500 fill-red-500 flex-shrink-0" />}
                            <p className="font-bold text-gray-900">{order.order_number}</p>
                          </div>
                        </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{order.customer_name}</p>
                        <p className="text-xs text-gray-500">{order.customer_email}</p>
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-900">
                        {formatPrice(order.total_amount)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize ${getStatusColor(
                            order.order_status
                          )}`}
                        >
                          {order.order_status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize ${getPaymentColor(
                            order.payment_status
                          )}`}
                        >
                          {order.payment_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleViewDetails(order)}
                            title="View Details"
                            className="border-gray-300 hover:bg-gray-100"
                          >
                            <Eye size={16} className="text-gray-700" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(order)}
                            title="Update Order"
                            className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10"
                          >
                            <Truck size={16} />
                          </Button>
                        </div>
                      </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Order Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-lg bg-white">
            <DialogHeader>
              <DialogTitle className="text-gray-900 text-xl font-bold">Order Details - {selectedOrder?.order_number}</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4">
                {/* Customer Info */}
                <div className="bg-gray-100 rounded-lg p-4 border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-2">Customer</h3>
                  <p className="text-sm text-gray-900 font-medium">{selectedOrder.customer_name}</p>
                  <p className="text-sm text-gray-600">{selectedOrder.customer_email}</p>
                  {selectedOrder.customer_phone && (
                    <p className="text-sm text-gray-600">{selectedOrder.customer_phone}</p>
                  )}
                </div>

                {/* Shipping Address */}
                <div className="bg-gray-100 rounded-lg p-4 border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-2">Shipping Address</h3>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">
                    {selectedOrder.shipping_address}
                  </p>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Items</h3>
                  <div className="space-y-2">
                    {orderItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center bg-gray-100 rounded-lg p-3 border border-gray-200"
                      >
                        <div>
                          <p className="text-sm font-bold text-gray-900">{item.product_name}</p>
                          <p className="text-xs text-gray-600">
                            {item.color} | {item.size} | Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-bold text-gray-900">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tracking Info */}
                {(selectedOrder.tracking_id || selectedOrder.courier_name) && (
                  <div className="bg-gray-100 rounded-lg p-4 border border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-2">Tracking</h3>
                    {selectedOrder.courier_name && (
                      <p className="text-sm text-gray-900">Courier: {selectedOrder.courier_name}</p>
                    )}
                    {selectedOrder.tracking_id && (
                      <p className="text-sm text-gray-600">
                        Tracking ID: {selectedOrder.tracking_id}
                      </p>
                    )}
                  </div>
                )}

                {/* Total */}
                <div className="flex justify-between items-center pt-4 border-t-2 border-gray-200">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-gray-900 text-lg">
                    {formatPrice(selectedOrder.total_amount)}
                  </span>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Order Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-md bg-white">
            <DialogHeader>
              <DialogTitle className="text-gray-900 text-xl font-bold">Update Order - {selectedOrder?.order_number}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              {/* Order Status */}
              <div className="space-y-2">
                <Label className="text-gray-900 font-bold">Order Status</Label>
                <Select
                  value={editData.order_status}
                  onValueChange={(value) =>
                    setEditData((prev) => ({ ...prev, order_status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {orderStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Courier Name */}
              <div className="space-y-2">
                <Label htmlFor="courier_name" className="text-gray-900 font-bold">Courier Name</Label>
                <Input
                  id="courier_name"
                  value={editData.courier_name}
                  onChange={(e) =>
                    setEditData((prev) => ({ ...prev, courier_name: e.target.value }))
                  }
                  placeholder="e.g., Delhivery, BlueDart"
                />
              </div>

              {/* Tracking ID */}
              <div className="space-y-2">
                <Label htmlFor="tracking_id" className="text-gray-900 font-bold">Tracking ID</Label>
                <Input
                  id="tracking_id"
                  value={editData.tracking_id}
                  onChange={(e) =>
                    setEditData((prev) => ({ ...prev, tracking_id: e.target.value }))
                  }
                  placeholder="Enter tracking number"
                />
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditOpen(false)}
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold"
                  disabled={updateOrder.isPending}
                >
                  {updateOrder.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Update
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
