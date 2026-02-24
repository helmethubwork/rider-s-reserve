import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PaymentFailed = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="py-20">
        <div className="container mx-auto px-4 text-center max-w-lg">
          <XCircle size={72} className="mx-auto text-destructive mb-6" />
          <h1 className="text-3xl font-bold text-foreground mb-3">Payment Failed</h1>
          <p className="text-muted-foreground mb-8">
            Something went wrong with your payment. Please try again.
          </p>
          <Button asChild>
            <Link to="/checkout">Retry Payment</Link>
          </Button>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default PaymentFailed;
