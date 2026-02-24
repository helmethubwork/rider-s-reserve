import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { CheckCircle, XCircle, ShoppingBag, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Status = 'loading' | 'success' | 'failed';

const PaymentStatus = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    if (!orderId) {
      setStatus('failed');
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`/api/verify-payment?order_id=${encodeURIComponent(orderId)}`);
        const data = await res.json();
        setStatus(data.status === 'SUCCESS' || data.status === 'PAID' ? 'success' : 'failed');
      } catch {
        setStatus('failed');
      }
    };

    verify();
  }, [orderId]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="py-20">
        <div className="container mx-auto px-4 text-center max-w-lg">
          {status === 'loading' && (
            <>
              <Loader2 size={72} className="mx-auto text-muted-foreground mb-6 animate-spin" />
              <h1 className="text-3xl font-bold text-foreground mb-3">Verifying Payment…</h1>
              <p className="text-muted-foreground">Please wait while we confirm your payment.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle size={72} className="mx-auto text-green-500 mb-6" />
              <h1 className="text-3xl font-bold text-foreground mb-3">Payment Successful 🎉</h1>
              <p className="text-muted-foreground mb-2">
                Your order has been confirmed and is being processed.
              </p>
              {orderId && (
                <p className="text-sm text-muted-foreground mb-8">
                  Order ID: <span className="font-semibold text-foreground">{orderId}</span>
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild>
                  <Link to="/sale">
                    <ShoppingBag className="mr-2" size={18} />
                    Continue Shopping
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/account">View My Orders</Link>
                </Button>
              </div>
            </>
          )}

          {status === 'failed' && (
            <>
              <XCircle size={72} className="mx-auto text-destructive mb-6" />
              <h1 className="text-3xl font-bold text-foreground mb-3">Payment Failed</h1>
              <p className="text-muted-foreground mb-8">
                Something went wrong with your payment. Please try again.
              </p>
              <Button asChild>
                <Link to="/checkout">Retry Payment</Link>
              </Button>
            </>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default PaymentStatus;
