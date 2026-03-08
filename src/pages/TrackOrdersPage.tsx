import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { goBack } from "@/lib/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { Package, Search, Truck, ArrowLeft, CheckCircle, Clock, XCircle, Loader2 } from "lucide-react";

interface TrackedOrder {
  order_number: string;
  order_status: string;
  payment_status: string;
  tracking_id: string | null;
  courier_name: string | null;
  shipped_at: string | null;
  total_amount: number;
  created_at: string;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'delivered': return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'shipped': return <Truck className="w-5 h-5 text-blue-500" />;
    case 'cancelled': return <XCircle className="w-5 h-5 text-destructive" />;
    default: return <Clock className="w-5 h-5 text-yellow-500" />;
  }
};

const getTrackingLink = (courier: string | null, trackingId: string | null) => {
  if (!trackingId) return null;
  const c = (courier || '').toLowerCase();
  if (c.includes('delhivery')) return `https://www.delhivery.com/track/package/${trackingId}`;
  if (c.includes('bluedart')) return `https://www.bluedart.com/tracking/${trackingId}`;
  if (c.includes('dtdc')) return `https://www.dtdc.in/tracking/${trackingId}`;
  if (c.includes('ekart')) return `https://ekartlogistics.com/track/${trackingId}`;
  return `https://www.google.com/search?q=${encodeURIComponent((courier || '') + ' tracking ' + trackingId)}`;
};

const TrackOrdersPage = () => {
  const navigate = useNavigate();
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TrackedOrder | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim() || !email.trim()) return;

    setIsLoading(true);
    setResult(null);
    setNotFound(false);

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('order_number, order_status, payment_status, tracking_id, courier_name, shipped_at, total_amount, created_at')
        .eq('order_number', orderNumber.trim().toUpperCase())
        .eq('customer_email', email.trim().toLowerCase())
        .maybeSingle();

      if (error || !data) {
        setNotFound(true);
      } else {
        setResult(data as TrackedOrder);
      }
    } catch {
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      timeZone: 'Asia/Kolkata',
    });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <div className="container mx-auto px-4 pt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => goBack(navigate)}
          className="flex items-center gap-1.5 text-foreground hover:text-primary"
        >
          <ArrowLeft size={16} />
          <span className="text-sm">Back</span>
        </Button>
      </div>

      <main className="flex-1 py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-brand-yellow/20 flex items-center justify-center">
                <Truck className="w-10 h-10 text-brand-yellow" />
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-center text-foreground tracking-wide mb-4">
              TRACK YOUR ORDER
            </h1>
            <p className="text-center text-muted-foreground mb-10">
              Enter your order details below to check the status of your shipment
            </p>
            
            <div className="bg-card border border-border rounded-xl p-8 shadow-lg">
              <form onSubmit={handleTrack} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-xs font-medium tracking-[0.15em] text-muted-foreground uppercase">
                    Order Number
                  </label>
                  <div className="relative">
                    <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                      className="w-full h-12 pl-11 border-border/50 focus:border-brand-yellow rounded-lg bg-background"
                      placeholder="e.g., HH-10001"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-medium tracking-[0.15em] text-muted-foreground uppercase">
                    Email Address
                  </label>
                  <div className="relative">
                    <svg 
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-12 pl-11 border-border/50 focus:border-brand-yellow rounded-lg bg-background"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-brand-yellow hover:bg-brand-yellow/90 text-black font-semibold tracking-[0.1em] uppercase rounded-lg mt-4 gap-2"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  {isLoading ? 'Tracking...' : 'Track Order'}
                </Button>
              </form>
            </div>

            {/* Result */}
            {result && (
              <div className="mt-8 bg-card border border-border rounded-xl p-6 shadow-lg space-y-4">
                <div className="flex items-center gap-3">
                  {getStatusIcon(result.order_status)}
                  <div>
                    <h2 className="font-bold text-foreground text-lg">{result.order_number}</h2>
                    <p className="text-sm text-muted-foreground capitalize">{result.order_status}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Order Date</p>
                    <p className="font-medium text-foreground">{formatDate(result.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Amount</p>
                    <p className="font-medium text-foreground">₹{result.total_amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Payment</p>
                    <p className="font-medium text-foreground capitalize">{result.payment_status}</p>
                  </div>
                  {result.shipped_at && (
                    <div>
                      <p className="text-muted-foreground">Shipped On</p>
                      <p className="font-medium text-foreground">{formatDate(result.shipped_at)}</p>
                    </div>
                  )}
                </div>

                {result.tracking_id && (
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-muted-foreground">Courier: <span className="font-medium text-foreground">{result.courier_name || 'N/A'}</span></p>
                    <p className="text-sm text-muted-foreground">Tracking ID: <span className="font-medium text-foreground">{result.tracking_id}</span></p>
                    {(() => {
                      const link = getTrackingLink(result.courier_name, result.tracking_id);
                      return link ? (
                        <a href={link} target="_blank" rel="noopener noreferrer"
                          className="inline-block mt-2 bg-brand-yellow text-black text-sm font-semibold px-4 py-2 rounded-lg hover:bg-brand-yellow/90">
                          Track on Courier Website →
                        </a>
                      ) : null;
                    })()}
                  </div>
                )}

                {!result.tracking_id && result.order_status === 'placed' && (
                  <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-4">
                    Your order is being prepared. Tracking details will be available once dispatched.
                  </p>
                )}
              </div>
            )}

            {notFound && (
              <div className="mt-8 bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center">
                <XCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
                <p className="font-medium text-foreground">Order not found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Please check your order number and email address, then try again.
                </p>
              </div>
            )}

            <p className="text-center text-sm text-muted-foreground mt-8">
              Can't find your order number? Check your confirmation email or{" "}
              <a href="/contact" className="text-brand-yellow hover:underline">
                contact support
              </a>
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TrackOrdersPage;
