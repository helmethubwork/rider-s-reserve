/**
 * Admin Dashboard
 * 
 * Clean overview page with stats and quick actions.
 * Shows recent orders and messages with read/unread indicators.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  MessageSquare, 
  ArrowRight,
  Plus,
  Eye,
  Settings,
  MapPin,
  Circle,
  IndianRupee,
  CalendarCheck
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { useAdminReadItems } from '@/hooks/useAdminReadItems';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  order_status: string;
  created_at: string;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  phone: string | null;
  created_at: string;
}

const AdminDashboard = () => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  // Use Supabase-backed read tracking
  const { isRead: isOrderRead, markAsRead: markOrderAsRead, getUnreadCount: getOrderUnreadCount } = useAdminReadItems('order');
  const { isRead: isMessageRead, markAsRead: markMessageAsRead, getUnreadCount: getMessageUnreadCount } = useAdminReadItems('message');

  // Fetch product count
  const { data: productCount = 0, isLoading: loadingProducts } = useQuery({
    queryKey: ['admin', 'products', 'count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch order count
  const { data: orderCount = 0, isLoading: loadingOrders } = useQuery({
    queryKey: ['admin', 'orders', 'count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch pending orders count
  const { data: pendingOrders = 0, isLoading: loadingPending } = useQuery({
    queryKey: ['admin', 'orders', 'pending'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('order_status', 'placed');
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch total revenue (paid orders)
  const { data: totalRevenue = 0, isLoading: loadingRevenue } = useQuery({
    queryKey: ['admin', 'revenue', 'total'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('payment_status', 'paid');
      if (error) throw error;
      return (data ?? []).reduce((sum, o) => sum + (o.total_amount || 0), 0);
    },
  });

  // Fetch orders today
  const { data: ordersToday = 0, isLoading: loadingToday } = useQuery({
    queryKey: ['admin', 'orders', 'today'],
    queryFn: async () => {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const { count, error } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayStart.toISOString());
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch messages count
  const { data: messageCount = 0, isLoading: loadingMessages } = useQuery({
    queryKey: ['admin', 'contact-messages', 'count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('contact_messages')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch recent orders (last 5)
  const { data: recentOrders = [] } = useQuery({
    queryKey: ['admin', 'orders', 'recent'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data as Order[];
    },
  });

  // Fetch recent messages (last 5)
  const { data: recentMessages = [] } = useQuery({
    queryKey: ['admin', 'messages', 'recent'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data as ContactMessage[];
    },
  });

  // Handle viewing order details
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    markOrderAsRead(order.id);
  };

  // Handle viewing message details
  const handleViewMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    markMessageAsRead(message.id);
  };

  // Format price
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'placed':
        return 'bg-amber-100 text-amber-700';
      case 'shipped':
        return 'bg-blue-100 text-blue-700';
      case 'delivered':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Count unread items
  const unreadOrdersCount = getOrderUnreadCount(recentOrders);
  const unreadMessagesCount = getMessageUnreadCount(recentMessages);

  const stats = [
    {
      label: 'Total Orders',
      value: orderCount,
      icon: ShoppingCart,
      href: '/admin/orders',
      color: 'bg-emerald-500',
      lightColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      isLoading: loadingOrders,
      formatValue: (v: number) => String(v),
    },
    {
      label: 'Total Revenue',
      value: totalRevenue,
      icon: IndianRupee,
      href: '/admin/orders',
      color: 'bg-green-500',
      lightColor: 'bg-green-50',
      textColor: 'text-green-600',
      isLoading: loadingRevenue,
      formatValue: (v: number) => formatPrice(v),
    },
    {
      label: 'Orders Today',
      value: ordersToday,
      icon: CalendarCheck,
      href: '/admin/orders',
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      isLoading: loadingToday,
      formatValue: (v: number) => String(v),
    },
    {
      label: 'Pending',
      value: pendingOrders,
      icon: TrendingUp,
      href: '/admin/orders',
      color: 'bg-orange-500',
      lightColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      isLoading: loadingPending,
      formatValue: (v: number) => String(v),
    },
    {
      label: 'Products',
      value: productCount,
      icon: Package,
      href: '/admin/products',
      color: 'bg-amber-500',
      lightColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      isLoading: loadingProducts,
      formatValue: (v: number) => String(v),
    },
    {
      label: 'Messages',
      value: messageCount,
      icon: MessageSquare,
      href: '/admin/messages',
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      isLoading: loadingMessages,
      formatValue: (v: number) => String(v),
    },
  ];

  const quickActions = [
    { label: 'Add Product', href: '/admin/products/add', icon: Plus, primary: true },
    { label: 'View Orders', href: '/admin/orders', icon: Eye },
    { label: 'Stores', href: '/admin/store-locations', icon: MapPin },
    { label: 'Settings', href: '/admin/site-settings', icon: Settings },
  ];

  return (
    <AdminLayout>
      <div className="space-y-5 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 text-sm">Welcome back! Here's your overview.</p>
          </div>
          <Button asChild className="bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold shadow-sm h-9 text-sm">
            <Link to="/admin/products/add">
              <Plus size={16} className="mr-1.5" />
              Add Product
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {stats.map((stat) => (
            <Link
              key={stat.label}
              to={stat.href}
              className="group bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-gray-300 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${stat.lightColor}`}>
                  <stat.icon size={18} className={stat.textColor} />
                </div>
                <ArrowRight size={14} className="text-gray-300 group-hover:text-gray-400 transition-colors mt-1" />
              </div>
              
              {stat.isLoading ? (
                <Skeleton className="h-7 w-12 mb-1" />
              ) : (
                <p className="text-2xl md:text-3xl font-bold text-gray-900">{stat.value}</p>
              )}
              <p className="text-xs md:text-sm text-gray-500 font-medium">{stat.label}</p>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5">
          <h2 className="font-semibold text-gray-900 text-sm mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                to={action.href}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  action.primary 
                    ? 'bg-amber-500 text-gray-900 hover:bg-amber-600 shadow-sm' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <action.icon size={16} />
                <span className="hidden sm:inline">{action.label}</span>
                <span className="sm:hidden">{action.label.split(' ').pop()}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Activity Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Recent Orders */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-gray-900 text-sm">Recent Orders</h2>
                {unreadOrdersCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {unreadOrdersCount}
                  </span>
                )}
              </div>
              <Link to="/admin/orders" className="text-xs text-amber-600 hover:text-amber-700 font-medium">
                View all →
              </Link>
            </div>
            {recentOrders.length === 0 ? (
              <div className="text-center py-6">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                  <ShoppingCart size={18} className="text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentOrders.map((order) => {
                  const isUnread = !isOrderRead(order.id);
                  return (
                    <button
                      key={order.id}
                      onClick={() => handleViewOrder(order)}
                      className={`w-full text-left p-3 rounded-lg border transition-all hover:shadow-sm ${
                        isUnread 
                          ? 'bg-red-50 border-red-200 hover:bg-red-100' 
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {isUnread && (
                            <Circle size={8} className="text-red-500 fill-red-500 flex-shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 text-sm truncate">
                              {order.order_number}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{order.customer_name}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-gray-900 text-sm">{formatPrice(order.total_amount)}</p>
                          <span className={`inline-block text-xs font-medium px-1.5 py-0.5 rounded capitalize ${getStatusColor(order.order_status)}`}>
                            {order.order_status}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Recent Messages */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-gray-900 text-sm">Messages</h2>
                {unreadMessagesCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {unreadMessagesCount}
                  </span>
                )}
              </div>
              <Link to="/admin/messages" className="text-xs text-amber-600 hover:text-amber-700 font-medium">
                View all →
              </Link>
            </div>
            {recentMessages.length === 0 ? (
              <div className="text-center py-6">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                  <MessageSquare size={18} className="text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">No messages yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentMessages.map((message) => {
                  const isUnread = !isMessageRead(message.id);
                  return (
                    <button
                      key={message.id}
                      onClick={() => handleViewMessage(message)}
                      className={`w-full text-left p-3 rounded-lg border transition-all hover:shadow-sm ${
                        isUnread 
                          ? 'bg-red-50 border-red-200 hover:bg-red-100' 
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {isUnread && (
                          <Circle size={8} className="text-red-500 fill-red-500 flex-shrink-0 mt-1.5" />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold text-gray-900 text-sm truncate">{message.name}</p>
                            <span className="text-xs text-gray-400 flex-shrink-0">
                              {format(new Date(message.created_at), 'MMM d')}
                            </span>
                          </div>
                          <p className="text-xs text-gray-700 font-medium truncate">{message.subject}</p>
                          <p className="text-xs text-gray-500 truncate">{message.message}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="admin-theme max-w-md bg-white text-gray-900">
          <DialogHeader>
            <DialogTitle className="text-gray-900 font-bold">
              Order {selectedOrder?.order_number}
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              {selectedOrder && format(new Date(selectedOrder.created_at), 'MMMM d, yyyy h:mm a')}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">Customer</p>
                    <p className="font-semibold text-gray-900">{selectedOrder.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Email</p>
                    <p className="font-medium text-gray-700">{selectedOrder.customer_email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Total</p>
                    <p className="font-bold text-gray-900">{formatPrice(selectedOrder.total_amount)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Status</p>
                    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded capitalize ${getStatusColor(selectedOrder.order_status)}`}>
                      {selectedOrder.order_status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button asChild variant="outline" size="sm">
                  <Link to="/admin/orders">View All Orders</Link>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Message Details Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="admin-theme max-w-md bg-white text-gray-900">
          <DialogHeader>
            <DialogTitle className="text-gray-900 font-bold">
              {selectedMessage?.subject}
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              From {selectedMessage?.name} on{' '}
              {selectedMessage?.created_at && format(new Date(selectedMessage.created_at), 'MMMM d, yyyy h:mm a')}
            </DialogDescription>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 font-medium">Email</p>
                  <p className="font-bold text-gray-900">{selectedMessage.email}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Phone</p>
                  <p className="font-bold text-gray-900">{selectedMessage.phone || 'Not provided'}</p>
                </div>
              </div>
              <div>
                <p className="text-gray-600 font-medium text-sm mb-2">Message</p>
                <div className="bg-gray-100 rounded-lg p-4 border border-gray-200">
                  <p className="whitespace-pre-wrap text-gray-900">{selectedMessage.message}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminDashboard;
