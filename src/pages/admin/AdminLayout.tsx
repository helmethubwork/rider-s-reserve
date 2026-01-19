/**
 * Admin Layout
 * 
 * Modern responsive admin layout with clean white theme.
 * Optimized for laptop, tablet, and mobile.
 */

import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Package, 
  ShoppingCart, 
  LayoutDashboard, 
  ArrowLeft, 
  MessageSquare, 
  RotateCcw, 
  Tag, 
  Grid3X3, 
  Image, 
  Star, 
  Settings, 
  MapPin,
  Menu,
  ChevronLeft,
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/brands', label: 'Brands', icon: Tag },
  { href: '/admin/categories', label: 'Categories', icon: Grid3X3 },
  { href: '/admin/hero-slider', label: 'Hero Slider', icon: Image },
  { href: '/admin/featured-promos', label: 'Promos', icon: Star },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
  { href: '/admin/return-requests', label: 'Returns', icon: RotateCcw },
  { href: '/admin/site-settings', label: 'Settings', icon: Settings },
  { href: '/admin/store-locations', label: 'Stores', icon: MapPin },
];

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavContent = ({ onItemClick, collapsed = false }: { onItemClick?: () => void; collapsed?: boolean }) => (
    <nav className="flex-1 py-2 space-y-0.5 overflow-y-auto px-3">
      {navItems.map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.href}
            to={item.href}
            onClick={onItemClick}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium',
              collapsed && 'justify-center px-2',
              isActive
                ? 'bg-amber-500 text-gray-900 shadow-md'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            )}
          >
            <item.icon size={18} className="flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="admin-theme min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          'hidden lg:flex flex-col bg-white border-r border-gray-200 transition-all duration-300 fixed top-0 left-0 h-screen z-30',
          sidebarCollapsed ? 'w-16' : 'w-56'
        )}
      >
        {/* Sidebar Header */}
        <div className={cn(
          'flex items-center h-14 border-b border-gray-100 px-3',
          sidebarCollapsed ? 'justify-center' : 'justify-between'
        )}>
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shadow-sm">
                <LayoutDashboard size={16} className="text-gray-900" />
              </div>
              <span className="font-bold text-gray-900 text-sm">Admin Panel</span>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shadow-sm">
              <LayoutDashboard size={16} className="text-gray-900" />
            </div>
          )}
        </div>

        {/* Collapse Toggle */}
        <div className="px-3 py-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={cn(
              'w-full h-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100',
              sidebarCollapsed ? 'px-0 justify-center' : 'justify-start px-3'
            )}
          >
            <ChevronLeft size={16} className={cn('transition-transform', sidebarCollapsed && 'rotate-180')} />
            {!sidebarCollapsed && <span className="ml-2 text-xs">Collapse</span>}
          </Button>
        </div>

        <NavContent collapsed={sidebarCollapsed} />

        {/* Back to Store */}
        <div className="p-3 border-t border-gray-100">
          <Link
            to="/"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors text-sm font-medium',
              sidebarCollapsed && 'justify-center px-2'
            )}
          >
            <Home size={18} />
            {!sidebarCollapsed && <span>Back to Store</span>}
          </Link>
        </div>
      </aside>

      {/* Main Area */}
      <div className={cn(
        'flex-1 flex flex-col min-w-0 transition-all duration-300',
        sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-56'
      )}>
        {/* Top Header */}
        <header className="sticky top-0 z-40 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shadow-sm">
          {/* Mobile Menu */}
          <div className="flex items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9 text-gray-600">
                  <Menu size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 bg-white border-r border-gray-200">
                <div className="flex items-center h-14 px-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
                      <LayoutDashboard size={16} className="text-gray-900" />
                    </div>
                    <span className="font-bold text-gray-900 text-sm">Admin Panel</span>
                  </div>
                </div>
                <NavContent onItemClick={() => setMobileOpen(false)} />
                <div className="p-3 border-t border-gray-100">
                  <Link
                    to="/"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors text-sm font-medium"
                  >
                    <Home size={18} />
                    <span>Back to Store</span>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
            
            {/* Page indicator for desktop */}
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="text-gray-400">Admin</span>
              <span className="text-gray-300">/</span>
              <span className="text-gray-700 font-medium capitalize">
                {location.pathname === '/admin' ? 'Dashboard' : location.pathname.split('/').pop()?.replace('-', ' ')}
              </span>
            </div>
          </div>
          
          {/* Right side */}
          <div className="flex items-center gap-2">
            <Link 
              to="/" 
              className="hidden sm:flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium"
            >
              <ArrowLeft size={16} />
              <span>Store</span>
            </Link>
            <div className="sm:hidden flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center">
                <LayoutDashboard size={14} className="text-gray-900" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-5 lg:p-6 overflow-x-hidden bg-gray-50">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
