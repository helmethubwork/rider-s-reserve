/**
 * Order Confirmation Page
 * 
 * Shown after successful order placement.
 * Displays order number and next steps.
 */

import { useParams, Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, Mail, ArrowRight } from 'lucide-react';

const OrderConfirmationPage = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto text-center">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-green-600" size={40} />
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Order Placed Successfully!
            </h1>

            {/* Order Number */}
            <div className="bg-card border border-border rounded-lg p-6 mb-8">
              <p className="text-sm text-muted-foreground mb-2">Order Number</p>
              <p className="text-2xl font-bold text-primary">{orderNumber}</p>
            </div>

            {/* Next Steps */}
            <div className="text-left bg-secondary/50 rounded-lg p-6 mb-8">
              <h2 className="font-semibold text-foreground mb-4">What happens next?</h2>
              
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Mail className="text-primary flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="font-medium text-foreground">Confirmation Email</p>
                    <p className="text-sm text-muted-foreground">
                      You'll receive an email with your order details shortly.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Package className="text-primary flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="font-medium text-foreground">Order Processing</p>
                    <p className="text-sm text-muted-foreground">
                      We'll prepare your order and ship it within 1-2 business days.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button asChild className="w-full" size="lg">
                <Link to={`/track-order?order=${orderNumber}`}>
                  Track Your Order
                  <ArrowRight className="ml-2" size={18} />
                </Link>
              </Button>

              <Button asChild variant="outline" className="w-full" size="lg">
                <Link to="/sale">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default OrderConfirmationPage;
