/**
 * Admin Layout
 * 
 * Modern responsive admin layout with collapsible sidebar.
 * Works seamlessly on laptop, tablet, and mobile.
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
  X,
  ChevronLeft
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

  const NavContent = ({ onItemClick }: { onItemClick?: () => void }) => (
    <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
      {navItems.map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.href}
            to={item.href}
            onClick={onItemClick}
            className={cn(
              'flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition-all duration-200',
              sidebarCollapsed && 'justify-center px-3',
              isActive
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30 font-bold'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            )}
          >
            <item.icon size={20} className="flex-shrink-0" />
            {!sidebarCollapsed && (
              <span className="truncate">{item.label}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          'hidden lg:flex flex-col bg-card border-r border-border transition-all duration-300 sticky top-0 h-screen',
          sidebarCollapsed ? 'w-[72px]' : 'w-64'
        )}
      >
        {/* Sidebar Header */}
        <div className={cn(
          'flex items-center h-16 border-b border-border px-4',
          sidebarCollapsed ? 'justify-center' : 'justify-between'
        )}>
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <LayoutDashboard size={18} className="text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">Admin</span>
            </div>
          )}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft size={18} className={cn('transition-transform', sidebarCollapsed && 'rotate-180')} />
          </Button>
        </div>

        <NavContent />

        {/* Back to Store */}
        <div className="p-4 border-t border-border">
          <Link
            to="/"
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors',
              sidebarCollapsed && 'justify-center px-3'
            )}
          >
            <ArrowLeft size={18} />
            {!sidebarCollapsed && <span>Back to Store</span>}
          </Link>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header (Mobile + Tablet) */}
        <header className="lg:hidden sticky top-0 z-40 h-14 bg-card/95 backdrop-blur border-b border-border flex items-center justify-between px-4">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu size={20} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 bg-card">
              <div className="flex items-center justify-between h-14 px-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                    <LayoutDashboard size={18} className="text-primary-foreground" />
                  </div>
                  <span className="font-bold text-foreground">Admin Panel</span>
                </div>
              </div>
              <NavContent onItemClick={() => setMobileOpen(false)} />
              <div className="p-4 border-t border-border">
                <Link
                  to="/"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                >
                  <ArrowLeft size={18} />
                  <span>Back to Store</span>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
          
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <LayoutDashboard size={14} className="text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground text-sm">Admin</span>
          </div>
          
          <Link to="/" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft size={20} />
          </Link>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
