/**
 * Admin Dashboard
 * 
 * Clean overview page with stats and quick actions.
 */

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
  MapPin
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const AdminDashboard = () => {
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

  const stats = [
    {
      label: 'Products',
      value: productCount,
      icon: Package,
      href: '/admin/products',
      color: 'bg-amber-500',
      lightColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      isLoading: loadingProducts,
    },
    {
      label: 'Orders',
      value: orderCount,
      icon: ShoppingCart,
      href: '/admin/orders',
      color: 'bg-emerald-500',
      lightColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      isLoading: loadingOrders,
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
    },
    {
      label: 'Messages',
      value: messageCount,
      icon: MessageSquare,
      href: '/admin/messages',
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      isLoading: loadingMessages,
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
          <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 text-sm">Recent Orders</h2>
              <Link to="/admin/orders" className="text-xs text-amber-600 hover:text-amber-700 font-medium">
                View all →
              </Link>
            </div>
            <div className="text-center py-6">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                <ShoppingCart size={18} className="text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">Orders will appear here</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 text-sm">Messages</h2>
              <Link to="/admin/messages" className="text-xs text-amber-600 hover:text-amber-700 font-medium">
                View all →
              </Link>
            </div>
            <div className="text-center py-6">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                <MessageSquare size={18} className="text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">Messages will appear here</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
