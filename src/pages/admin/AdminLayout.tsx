/**
 * Admin Layout
 * 
 * Provides consistent layout for admin pages.
 * Includes admin navigation sidebar.
 */

import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Package, ShoppingCart, LayoutDashboard, ArrowLeft, MessageSquare, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();

  const navItems = [
    {
      href: '/admin',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      href: '/admin/products',
      label: 'Products',
      icon: Package,
    },
    {
      href: '/admin/orders',
      label: 'Orders',
      icon: ShoppingCart,
    },
    {
      href: '/admin/messages',
      label: 'Messages',
      icon: MessageSquare,
    },
    {
      href: '/admin/return-requests',
      label: 'Return Requests',
      icon: RotateCcw,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Back to Store Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors font-medium"
        >
          <ArrowLeft size={18} />
          Back to Store
        </Link>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border-2 border-gray-200 p-4 sticky top-24 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-4 px-3 text-lg">Admin Panel</h2>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all font-medium',
                        isActive
                          ? 'bg-gray-900 text-white shadow-md'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      )}
                    >
                      <item.icon size={20} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminLayout;
