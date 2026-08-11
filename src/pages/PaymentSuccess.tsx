import { useSearchParams, Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { CheckCircle, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="py-20">
        <div className="container mx-auto px-4 text-center max-w-lg">
          <CheckCircle size={72} className="mx-auto text-green-500 mb-6" />
          <h1 className="text-3xl font-bold text-foreground mb-3">Payment Successful 🎉</h1>
          <p className="text-muted-foreground mb-2">
            Your order has been confirmed and is being prepared.
          </p>
          <p className="text-sm text-muted-foreground mb-2">
            Tracking details and invoice will be sent to your email within 24 hours once the order is dispatched.
          </p>
          {orderId && (
            <p className="text-sm text-muted-foreground mb-8">
              Order ID: <span className="font-semibold text-foreground">{orderId}</span>
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link to="/">
                <ShoppingBag className="mr-2" size={18} />
                Continue Shopping
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/account">View My Orders</Link>
            </Button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
