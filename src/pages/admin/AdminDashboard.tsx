/**
 * Admin Dashboard
 * 
 * Overview page for admin panel.
 * Shows quick stats and links.
 */

import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { Package, ShoppingCart, TrendingUp, MessageSquare } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

const AdminDashboard = () => {
  // Fetch product count
  const { data: productCount = 0 } = useQuery({
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
  const { data: orderCount = 0 } = useQuery({
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
  const { data: pendingOrders = 0 } = useQuery({
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
  const { data: messageCount = 0 } = useQuery({
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
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Total Orders',
      value: orderCount,
      icon: ShoppingCart,
      href: '/admin/orders',
      color: 'text-green-500',
      bg: 'bg-green-500/10',
    },
    {
      label: 'Pending Orders',
      value: pendingOrders,
      icon: TrendingUp,
      href: '/admin/orders',
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
    },
    {
      label: 'Messages',
      value: messageCount,
      icon: MessageSquare,
      href: '/admin/messages',
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Title */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to the admin panel</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Link
              key={stat.label}
              to={stat.href}
              className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={stat.color} size={24} />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4 text-lg">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/products"
              className="px-5 py-2.5 bg-yellow-500 text-gray-900 rounded-lg hover:bg-yellow-600 transition-colors font-bold shadow-lg"
            >
              Manage Products
            </Link>
            <Link
              to="/admin/orders"
              className="px-5 py-2.5 bg-white text-gray-900 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              View Orders
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
