import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Package, Search, Truck, ArrowLeft } from "lucide-react";

const TrackOrdersPage = () => {
  const navigate = useNavigate();
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderNumber || !email) {
      toast({
        title: "Missing Information",
        description: "Please enter both order number and email address.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Tracking Order",
      description: `Looking up order ${orderNumber}...`,
    });
    
    // Here you would typically call an API to track the order
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      {/* Back Button */}
      <div className="container mx-auto px-4 pt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={16} />
          <span className="text-sm">Back</span>
        </Button>
      </div>

      <main className="flex-1 py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-brand-yellow/20 flex items-center justify-center">
                <Truck className="w-10 h-10 text-brand-yellow" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-center text-foreground tracking-wide mb-4">
              TRACK YOUR ORDER
            </h1>
            <p className="text-center text-muted-foreground mb-10">
              Enter your order details below to check the status of your shipment
            </p>
            
            {/* Form Card */}
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
                      placeholder="e.g., HH-123456"
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
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
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
                  className="w-full h-12 bg-brand-yellow hover:bg-brand-yellow/90 text-black font-semibold tracking-[0.1em] uppercase rounded-lg mt-4 gap-2"
                >
                  <Search className="w-4 h-4" />
                  Track Order
                </Button>
              </form>
            </div>

            {/* Help Text */}
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
