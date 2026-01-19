/**
 * Admin Layout
 * 
 * Modern responsive admin layout with clean white theme.
 * Optimized for laptop, tablet, and mobile.
 * Includes unread indicators for orders, messages, and returns.
 */

import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  Home,
  Circle,
  Instagram,
  FileText,
  HelpCircle,
  Link as LinkIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface AdminLayoutProps {
  children: ReactNode;
}

// Helper to get read items from localStorage
const getReadItems = (key: string): string[] => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, trackUnread: false },
  { href: '/admin/products', label: 'Products', icon: Package, trackUnread: false },
  { href: '/admin/brands', label: 'Brands', icon: Tag, trackUnread: false },
  { href: '/admin/categories', label: 'Categories', icon: Grid3X3, trackUnread: false },
  { href: '/admin/hero-slider', label: 'Hero Slider', icon: Image, trackUnread: false },
  { href: '/admin/featured-promos', label: 'Promos', icon: Star, trackUnread: false },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart, trackUnread: true, storageKey: 'admin_read_orders' },
  { href: '/admin/messages', label: 'Messages', icon: MessageSquare, trackUnread: true, storageKey: 'admin_read_messages' },
  { href: '/admin/return-requests', label: 'Returns', icon: RotateCcw, trackUnread: true, storageKey: 'admin_read_returns' },
  { href: '/admin/blog', label: 'Blog', icon: FileText, trackUnread: false },
  { href: '/admin/faqs', label: 'FAQs', icon: HelpCircle, trackUnread: false },
  { href: '/admin/navigation-links', label: 'Navigation', icon: LinkIcon, trackUnread: false },
  { href: '/admin/instagram', label: 'Instagram', icon: Instagram, trackUnread: false },
  { href: '/admin/site-settings', label: 'Settings', icon: Settings, trackUnread: false },
  { href: '/admin/store-locations', label: 'Stores', icon: MapPin, trackUnread: false },
];

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [readOrders, setReadOrders] = useState<string[]>([]);
  const [readMessages, setReadMessages] = useState<string[]>([]);
  const [readReturns, setReadReturns] = useState<string[]>([]);

  useEffect(() => {
    setReadOrders(getReadItems('admin_read_orders'));
    setReadMessages(getReadItems('admin_read_messages'));
    setReadReturns(getReadItems('admin_read_returns'));
  }, []);

  // Fetch recent orders for unread count
  const { data: recentOrders = [] } = useQuery({
    queryKey: ['admin', 'orders', 'recent-ids'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch recent messages for unread count
  const { data: recentMessages = [] } = useQuery({
    queryKey: ['admin', 'messages', 'recent-ids'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch recent return requests for unread count
  const { data: recentReturns = [] } = useQuery({
    queryKey: ['admin', 'returns', 'recent-ids'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('return_requests')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) return [];
      return data || [];
    },
  });

  // Calculate unread counts
  const unreadCounts: Record<string, number> = {
    '/admin/orders': recentOrders.filter(o => !readOrders.includes(o.id)).length,
    '/admin/messages': recentMessages.filter(m => !readMessages.includes(m.id)).length,
    '/admin/return-requests': recentReturns.filter(r => !readReturns.includes(r.id)).length,
  };

  // Check if we can go back within admin or should go to store
  const handleBack = () => {
    if (location.pathname !== '/admin' && location.pathname.startsWith('/admin')) {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  const NavContent = ({ onItemClick, collapsed = false }: { onItemClick?: () => void; collapsed?: boolean }) => (
    <nav className="flex-1 py-3 space-y-1 overflow-y-auto px-3">
      {navItems.map((item) => {
        const isActive = location.pathname === item.href;
        const unreadCount = item.trackUnread ? unreadCounts[item.href] || 0 : 0;
        const hasUnread = unreadCount > 0;
        
        return (
          <Link
            key={item.href}
            to={item.href}
            onClick={onItemClick}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium relative',
              collapsed && 'justify-center px-2',
              isActive
                ? 'bg-amber-500 text-gray-900 shadow-md font-semibold'
                : hasUnread
                  ? 'text-gray-800 bg-red-50 hover:bg-red-100 border border-red-200'
                  : 'text-gray-700 hover:bg-amber-50 hover:text-amber-700'
            )}
          >
            <div className="relative">
              <item.icon size={18} className={cn('flex-shrink-0', isActive ? 'text-gray-900' : hasUnread ? 'text-red-600' : 'text-gray-500')} />
              {hasUnread && collapsed && (
                <Circle size={8} className="absolute -top-1 -right-1 text-red-500 fill-red-500" />
              )}
            </div>
            {!collapsed && (
              <>
                <span className={hasUnread && !isActive ? 'text-red-700 font-semibold' : ''}>{item.label}</span>
                {hasUnread && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {unreadCount}
                  </span>
                )}
              </>
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="admin-theme min-h-screen bg-gray-100 flex">
      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          'hidden lg:flex flex-col bg-white border-r border-gray-200 transition-all duration-300 fixed top-0 left-0 h-screen z-30 shadow-sm',
          sidebarCollapsed ? 'w-16' : 'w-56'
        )}
      >
        {/* Sidebar Header */}
        <div className={cn(
          'flex items-center h-14 border-b border-gray-200 px-3',
          sidebarCollapsed ? 'justify-center' : 'justify-between'
        )}>
          {!sidebarCollapsed && (
            <Link to="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-sm">
                <LayoutDashboard size={16} className="text-white" />
              </div>
              <span className="font-bold text-gray-900 text-sm">Admin Panel</span>
            </Link>
          )}
          {sidebarCollapsed && (
            <Link to="/admin">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-sm">
                <LayoutDashboard size={16} className="text-white" />
              </div>
            </Link>
          )}
        </div>

        {/* Collapse Toggle */}
        <div className="px-3 py-2 border-b border-gray-100">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={cn(
              'w-full h-8 text-gray-500 hover:text-gray-900 hover:bg-amber-50',
              sidebarCollapsed ? 'px-0 justify-center' : 'justify-start px-3'
            )}
          >
            <ChevronLeft size={16} className={cn('transition-transform', sidebarCollapsed && 'rotate-180')} />
            {!sidebarCollapsed && <span className="ml-2 text-xs">Collapse</span>}
          </Button>
        </div>

        <NavContent collapsed={sidebarCollapsed} />

        {/* Back to Store */}
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <Link
            to="/"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors text-sm font-medium shadow-sm',
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
          {/* Left side */}
          <div className="flex items-center gap-3">
            {/* Mobile Menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9 text-gray-700 hover:bg-amber-50">
                  <Menu size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 bg-white border-r border-gray-200">
                <div className="flex items-center justify-between h-14 px-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                      <LayoutDashboard size={16} className="text-white" />
                    </div>
                    <span className="font-bold text-gray-900 text-sm">Admin Panel</span>
                  </div>
                </div>
                <NavContent onItemClick={() => setMobileOpen(false)} />
                <div className="p-3 border-t border-gray-200 bg-gray-50">
                  <Link
                    to="/"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors text-sm font-medium"
                  >
                    <Home size={18} />
                    <span>Back to Store</span>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
            
            {/* Back button for sub-pages */}
            {location.pathname !== '/admin' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="hidden sm:flex items-center gap-1.5 text-gray-600 hover:text-gray-900 hover:bg-amber-50 h-8 px-2"
              >
                <ArrowLeft size={16} />
                <span className="text-sm">Back</span>
              </Button>
            )}
            
            {/* Page indicator */}
            <div className="flex items-center gap-2 text-sm">
              <Link to="/admin" className="text-gray-400 hover:text-amber-600 transition-colors">Admin</Link>
              {location.pathname !== '/admin' && (
                <>
                  <span className="text-gray-300">/</span>
                  <span className="text-gray-800 font-medium capitalize">
                    {location.pathname.split('/').pop()?.replace(/-/g, ' ')}
                  </span>
                </>
              )}
            </div>
          </div>
          
          {/* Right side */}
          <div className="flex items-center gap-2">
            <Link 
              to="/" 
              className="flex items-center gap-2 text-sm bg-gray-900 text-white hover:bg-gray-800 px-3 py-1.5 rounded-lg transition-colors font-medium shadow-sm"
            >
              <Home size={14} />
              <span className="hidden sm:inline">Store</span>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-5 lg:p-6 overflow-x-hidden">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
