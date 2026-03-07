/**
 * My Orders Page
 * 
 * Shows authenticated user's order history fetched from Supabase.
 * Displays order ID, date, amount, payment & order status with a View Order button.
 */

import { Link, Navigate, useNavigate } from 'react-router-dom';
import { goBack } from '@/lib/navigation';
import { ChevronLeft, ShoppingBag, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserOrders, Order } from '@/hooks/useOrders';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

const statusColors: Record<string, string> = {
  placed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-yellow-100 text-yellow-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const paymentColors: Record<string, string> = {
  pending: 'bg-orange-100 text-orange-800',
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
};

const formatPrice = (value: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(value);

const OrderRow = ({ order }: { order: Order }) => (
  <div className="bg-card border border-border rounded-lg p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
    {/* Order Info */}
    <div className="flex-1 min-w-0 space-y-1">
      <p className="font-bold text-foreground text-sm sm:text-base">{order.order_number}</p>
      <p className="text-xs text-muted-foreground">
        {format(new Date(order.created_at), 'dd MMM yyyy, hh:mm a')}
      </p>
    </div>

    {/* Amount */}
    <div className="sm:text-right">
      <p className="text-sm font-semibold text-foreground">{formatPrice(order.total_amount)}</p>
    </div>

    {/* Statuses */}
    <div className="flex items-center gap-2 flex-wrap">
      <Badge className={paymentColors[order.payment_status] || ''} variant="secondary">
        {order.payment_status}
      </Badge>
      <Badge className={statusColors[order.order_status] || ''} variant="secondary">
        {order.order_status}
      </Badge>
    </div>

    {/* View Order */}
    <Button variant="outline" size="sm" asChild className="shrink-0">
      <Link to={`/account/orders/${order.id}`}>
        <Eye size={14} className="mr-1.5" />
        View Order
      </Link>
    </Button>
  </div>
);

const MyOrdersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: orders, isLoading } = useUserOrders(user?.id);

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <div className="container mx-auto px-4 pt-4">
        <button
          onClick={() => goBack(navigate)}
          className="flex items-center gap-2 text-foreground hover:text-primary transition-colors font-medium text-sm"
        >
          <ChevronLeft size={18} />
          Back
        </button>
      </div>

      <main className="flex-1 container mx-auto px-4 py-6 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">My Orders</h1>

        {/* Table header - desktop */}
        <div className="hidden sm:flex items-center gap-4 px-5 pb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <span className="flex-1">Order</span>
          <span className="w-24 text-right">Amount</span>
          <span className="w-40">Status</span>
          <span className="w-28"></span>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        ) : !orders?.length ? (
          <div className="text-center py-16">
            <ShoppingBag className="mx-auto text-muted-foreground mb-4" size={48} />
            <h2 className="text-xl font-semibold text-foreground mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-6">Start shopping to see your orders here.</p>
            <Button asChild>
              <Link to="/sale">Browse Products</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MyOrdersPage;
