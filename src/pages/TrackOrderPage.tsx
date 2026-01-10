import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PromoBanner from "@/components/PromoBanner";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TrackOrderPage = () => {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !email) {
      toast({
        title: "Missing Information",
        description: "Please enter both Order ID and Email.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Tracking Request Submitted",
      description: "We're looking up your order. You'll receive an update shortly.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      {/* Promo Banner - Scrolls with content */}
      <PromoBanner />
      
      <main className="flex-1 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-10">
              <Package size={48} className="mx-auto text-primary mb-4" />
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                Track Your Order
              </h1>
              <p className="text-muted-foreground">
                Enter your order details below to check the status of your shipment.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-card p-8 border border-border rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="orderId">Order ID</Label>
                <Input
                  id="orderId"
                  type="text"
                  placeholder="e.g., HH-123456"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter the email used for your order"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background"
                />
              </div>

              <Button type="submit" className="w-full" size="lg">
                <Search size={18} className="mr-2" />
                Track Order
              </Button>
            </form>

            <div className="mt-10 text-center text-sm text-muted-foreground">
              <p>
                Can't find your order ID? Check your order confirmation email or{" "}
                <a href="/contact" className="text-primary hover:underline">
                  contact our support team
                </a>.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TrackOrderPage;
