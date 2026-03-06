/**
 * Checkout Page
 * 
 * Allows users to complete their order.
 * Works for both logged-in and guest users.
 * Payment is set to pending - integration will be added later.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { trackBeginCheckout } from '@/lib/analytics';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateOrder } from '@/hooks/useOrders';
import { ShoppingBag, CreditCard, Truck, AlertCircle, ArrowLeft } from 'lucide-react';
import { z } from 'zod';
import { startCashfreePayment } from '@/lib/cashfree';
import { getShippingCost, SHIPPING_INFO_LINES } from '@/lib/shipping';

// Form validation schema
const checkoutSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  email: z.string().trim().email('Please enter a valid email'),
  phone: z.string().trim().min(10, 'Please enter a valid phone number').max(15, 'Phone number is too long'),
  address: z.string().trim().min(10, 'Please enter a complete address').max(500, 'Address is too long'),
});

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { user, profile } = useAuth();
  const createOrder = useCreateOrder();

  // Pre-fill form with user data if logged in
  const [formData, setFormData] = useState({
    name: profile?.full_name || '',
    email: user?.email || '',
    phone: profile?.phone || '',
    address: '',
  });

  // Track begin_checkout on mount
  useEffect(() => {
    if (items.length > 0) {
      trackBeginCheckout(items, totalPrice);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Format price for display
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Calculate shipping
  const shippingCost = totalPrice >= 5000 ? 0 : 99;
  const orderTotal = totalPrice + shippingCost;

  // Handle input change
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const result = checkoutSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          newErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    // Check if cart has items
    if (items.length === 0) {
      navigate('/cart');
      return;
    }

    // Create order in database first, then start Cashfree payment
    try {
      const order = await createOrder.mutateAsync({
        customer_email: formData.email,
        customer_name: formData.name,
        customer_phone: formData.phone,
        shipping_address: formData.address,
        total_amount: orderTotal,
        user_id: user?.id,
        items: items.map((item) => ({
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          price: item.price,
          color: item.color,
          size: item.size,
        })),
      });

      // Call Cashfree API to create payment session
      const res = await fetch('/api/create-cashfree-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.order_number,
          orderAmount: orderTotal,
          customerId: user?.id || formData.email,
          customerEmail: formData.email,
          customerPhone: formData.phone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to initiate payment');
      }

      // Clear cart and start Cashfree checkout
      clearCart();
      await startCashfreePayment(data);
    } catch (error) {
      console.error('Checkout error:', error);
    }
  };

  // Redirect if cart is empty
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <ShoppingBag size={64} className="mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-4">Your cart is empty</h1>
            <Button onClick={() => navigate('/sale')}>Continue Shopping</Button>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Back Button */}
      <div className="container mx-auto px-4 pt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/cart')}
          className="flex items-center gap-1.5 text-foreground hover:text-primary"
        >
          <ArrowLeft size={16} />
          <span className="text-sm">Back to Cart</span>
        </Button>
      </div>

      <section className="py-8">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">
            Checkout
          </h1>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Checkout Form */}
            <div className="bg-card rounded-lg p-6 border border-border">
              <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <Truck className="text-primary" />
                Shipping Information
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={errors.name ? 'border-destructive' : ''}
                    placeholder="Enter your full name"
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={errors.email ? 'border-destructive' : ''}
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={errors.phone ? 'border-destructive' : ''}
                    placeholder="Enter your phone number"
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone}</p>
                  )}
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label htmlFor="address">
                    Shipping Address <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className={errors.address ? 'border-destructive' : ''}
                    placeholder="Enter your complete shipping address"
                    rows={3}
                  />
                  {errors.address && (
                    <p className="text-sm text-destructive">{errors.address}</p>
                  )}
                </div>

                {/* Payment Notice */}
                <div className="bg-secondary/50 rounded-lg p-4 flex gap-3">
                  <AlertCircle className="text-primary flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="text-sm font-medium text-foreground">Payment on Delivery</p>
                    <p className="text-sm text-muted-foreground">
                      Online payment will be available soon. Currently, we accept Cash on Delivery.
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={createOrder.isPending}
                >
                  <CreditCard className="mr-2" size={20} />
                  {createOrder.isPending ? 'Processing...' : `Pay Now - ${formatPrice(orderTotal)}`}
                </Button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="bg-card rounded-lg p-6 border border-border h-fit sticky top-24">
              <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <ShoppingBag className="text-primary" />
                Order Summary
              </h2>

              {/* Items */}
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div
                    key={`${item.id}-${item.color}-${item.size}`}
                    className="flex gap-3"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.color} | {item.size} | Qty: {item.quantity}
                      </p>
                      <p className="text-sm font-semibold text-primary">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 border-t border-border pt-4">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}</span>
                </div>
                <div className="flex justify-between font-bold text-foreground text-lg pt-2 border-t border-border">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(orderTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CheckoutPage;
