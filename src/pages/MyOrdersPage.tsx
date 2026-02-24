/**
 * My Orders Page
 * 
 * Shows authenticated user's order history with status and items.
 */

import { Link, Navigate, useNavigate } from 'react-router-dom';
import { goBack } from '@/lib/navigation';
import { ChevronLeft, Package, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserOrders, useOrderItems, Order } from '@/hooks/useOrders';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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

const OrderItemsList = ({ orderId }: { orderId: string }) => {
  const { data: items, isLoading } = useOrderItems(orderId);

  if (isLoading) return <Skeleton className="h-4 w-48" />;
  if (!items?.length) return <p className="text-xs text-muted-foreground">No items</p>;

  return (
    <ul className="space-y-1">
      {items.map((item) => (
        <li key={item.id} className="text-sm text-muted-foreground flex justify-between">
          <span>
            {item.product_name || 'Product'} × {item.quantity}
            {item.color && <span className="ml-1 text-xs">({item.color})</span>}
            {item.size && <span className="ml-1 text-xs">- {item.size}</span>}
          </span>
          <span className="font-medium text-foreground">₹{(item.price * item.quantity).toLocaleString()}</span>
        </li>
      ))}
    </ul>
  );
};

const OrderCard = ({ order }: { order: Order }) => (
  <Card>
    <CardContent className="p-4 sm:p-6 space-y-3">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-bold text-foreground">{order.order_number}</p>
          <p className="text-xs text-muted-foreground">
            {format(new Date(order.created_at), 'dd MMM yyyy, hh:mm a')}
          </p>
        </div>
        <div className="flex gap-2">
          <Badge className={statusColors[order.order_status] || ''} variant="secondary">
            {order.order_status}
          </Badge>
          <Badge className={paymentColors[order.payment_status] || ''} variant="secondary">
            {order.payment_status}
          </Badge>
        </div>
      </div>

      {/* Items */}
      <OrderItemsList orderId={order.id} />

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <p className="font-semibold text-foreground">
          Total: ₹{order.total_amount.toLocaleString()}
        </p>
        {order.tracking_id && (
          <p className="text-xs text-muted-foreground">
            Tracking: {order.tracking_id} {order.courier_name && `(${order.courier_name})`}
          </p>
        )}
      </div>
    </CardContent>
  </Card>
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

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
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
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MyOrdersPage;
