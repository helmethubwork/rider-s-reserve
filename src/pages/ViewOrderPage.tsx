/**
 * View Order Page
 * 
 * Displays full details of a single order for the logged-in user.
 */

import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { goBack } from '@/lib/navigation';
import { ChevronLeft, Package, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrderById, useOrderItems } from '@/hooks/useOrders';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
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

const ViewOrderPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: order, isLoading, error } = useOrderById(orderId || '');
  const { data: items, isLoading: itemsLoading } = useOrderItems(order?.id || '');

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
          Back to Orders
        </button>
      </div>

      <main className="flex-1 container mx-auto px-4 py-6 sm:py-8 max-w-3xl">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        ) : !order ? (
          <div className="text-center py-16">
            <AlertCircle className="mx-auto text-muted-foreground mb-4" size={48} />
            <h2 className="text-xl font-semibold text-foreground mb-2">Order not found</h2>
            <p className="text-muted-foreground">This order doesn't exist or you don't have access to it.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                {order.order_number}
              </h1>
              <div className="flex gap-2">
                <Badge className={paymentColors[order.payment_status] || ''} variant="secondary">
                  {order.payment_status}
                </Badge>
                <Badge className={statusColors[order.order_status] || ''} variant="secondary">
                  {order.order_status}
                </Badge>
              </div>
            </div>

            {/* Order Details Card */}
            <div className="bg-card border border-border rounded-lg divide-y divide-border">
              {/* Customer & Order Info */}
              <div className="p-5 grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Order ID</p>
                  <p className="text-sm font-semibold text-foreground">{order.order_number}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Order Date</p>
                  <p className="text-sm text-foreground">
                    {format(new Date(order.created_at), 'dd MMM yyyy, hh:mm a')}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Customer Name</p>
                  <p className="text-sm text-foreground">{order.customer_name}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Phone</p>
                  <p className="text-sm text-foreground">{order.customer_phone || '—'}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Shipping Address</p>
                  <p className="text-sm text-foreground">{order.shipping_address || '—'}</p>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Items</p>
                {itemsLoading ? (
                  <div className="space-y-2">
                    {[1, 2].map((i) => <Skeleton key={i} className="h-5 w-full" />)}
                  </div>
                ) : !items?.length ? (
                  <p className="text-sm text-muted-foreground">No items found</p>
                ) : (
                  <ul className="space-y-2">
                    {items.map((item) => (
                      <li key={item.id} className="flex justify-between text-sm">
                        <span className="text-foreground">
                          {item.product_name} × {item.quantity}
                          {item.color && <span className="text-muted-foreground ml-1">({item.color})</span>}
                          {item.size && <span className="text-muted-foreground ml-1">- {item.size}</span>}
                        </span>
                        <span className="font-medium text-foreground">{formatPrice(item.price * item.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Total */}
              <div className="p-5 flex justify-between items-center">
                <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                <p className="text-lg font-bold text-primary">{formatPrice(order.total_amount)}</p>
              </div>

              {/* Shipment Tracking */}
              <div className="p-5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Shipment Tracking</p>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Order Status</p>
                    <Badge className={statusColors[order.order_status] || ''} variant="secondary">
                      {order.order_status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Courier</p>
                    <p className="text-sm font-medium text-foreground">{order.courier_name || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Tracking ID</p>
                    <p className="text-sm font-medium text-foreground">{order.tracking_id || '—'}</p>
                  </div>
                </div>
                {order.tracking_id && (
                  <div className="mt-3 bg-secondary/50 rounded-lg p-3 flex items-start gap-2">
                    <Package size={16} className="text-primary mt-0.5 shrink-0" />
                    <p className="text-sm text-foreground">
                      Your order is being shipped via <span className="font-medium">{order.courier_name || 'courier'}</span>.
                      Tracking ID: <span className="font-mono font-medium">{order.tracking_id}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ViewOrderPage;
