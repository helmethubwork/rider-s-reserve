/**
 * Admin Dashboard
 * 
 * Modern overview page for admin panel with stats and quick actions.
 */

import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  MessageSquare, 
  ArrowUpRight,
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
      label: 'Active Products',
      value: productCount,
      icon: Package,
      href: '/admin/products',
      gradient: 'from-yellow-500 to-amber-600',
      isLoading: loadingProducts,
    },
    {
      label: 'Total Orders',
      value: orderCount,
      icon: ShoppingCart,
      href: '/admin/orders',
      gradient: 'from-emerald-500 to-green-600',
      isLoading: loadingOrders,
    },
    {
      label: 'Pending',
      value: pendingOrders,
      icon: TrendingUp,
      href: '/admin/orders',
      gradient: 'from-orange-500 to-red-500',
      isLoading: loadingPending,
    },
    {
      label: 'Messages',
      value: messageCount,
      icon: MessageSquare,
      href: '/admin/messages',
      gradient: 'from-blue-500 to-indigo-600',
      isLoading: loadingMessages,
    },
  ];

  const quickActions = [
    { label: 'Add Product', href: '/admin/products/add', icon: Plus },
    { label: 'View Orders', href: '/admin/orders', icon: Eye },
    { label: 'Store Locations', href: '/admin/store-locations', icon: MapPin },
    { label: 'Site Settings', href: '/admin/site-settings', icon: Settings },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground text-sm md:text-base">Welcome back! Here's your store overview.</p>
          </div>
          <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg">
            <Link to="/admin/products/add">
              <Plus size={18} className="mr-2" />
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
              className="group relative bg-card rounded-2xl border border-border p-4 md:p-6 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              {/* Gradient accent */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
              
              <div className="relative">
                <div className={`inline-flex p-2.5 md:p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg mb-3 md:mb-4`}>
                  <stat.icon size={20} className="text-white md:w-6 md:h-6" />
                </div>
                
                {stat.isLoading ? (
                  <Skeleton className="h-8 w-16 mb-1" />
                ) : (
                  <p className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</p>
                )}
                <p className="text-xs md:text-sm text-muted-foreground font-medium">{stat.label}</p>
              </div>
              
              <ArrowUpRight 
                size={18} 
                className="absolute top-4 right-4 text-muted-foreground/30 group-hover:text-primary transition-colors" 
              />
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-card rounded-2xl border border-border p-4 md:p-6">
          <h2 className="font-bold text-foreground text-lg mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                to={action.href}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors text-center group"
              >
                <div className="p-3 rounded-xl bg-background border border-border group-hover:border-primary/30 group-hover:bg-primary/5 transition-colors">
                  <action.icon size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <span className="text-sm font-medium text-foreground">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity Placeholder */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-card rounded-2xl border border-border p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-foreground text-lg">Recent Orders</h2>
              <Link to="/admin/orders" className="text-sm text-primary hover:underline font-medium">
                View all
              </Link>
            </div>
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Order activity will appear here</p>
            </div>
          </div>
          
          <div className="bg-card rounded-2xl border border-border p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-foreground text-lg">Messages</h2>
              <Link to="/admin/messages" className="text-sm text-primary hover:underline font-medium">
                View all
              </Link>
            </div>
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Customer messages will appear here</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
