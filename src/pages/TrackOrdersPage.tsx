import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const TrackOrdersPage = () => {
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
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1 pt-0 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-normal text-center text-navy-900 tracking-wide mb-12 uppercase">
              Track Your Order
            </h1>
            
            <form onSubmit={handleTrack} className="space-y-8">
              <div className="space-y-3">
                <label className="block text-center text-sm font-medium tracking-[0.2em] text-gray-700 uppercase">
                  Order Number
                </label>
                <Input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="w-full h-12 border-gray-300 focus:border-primary focus:ring-primary"
                  placeholder=""
                />
              </div>

              <div className="space-y-3">
                <label className="block text-center text-sm font-medium tracking-[0.2em] text-gray-700 uppercase">
                  Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 border-gray-300 focus:border-primary focus:ring-primary"
                  placeholder=""
                />
              </div>

              <div className="flex justify-center pt-4">
                <Button
                  type="submit"
                  className="bg-[#c8e621] hover:bg-[#b5d11e] text-black font-medium tracking-[0.15em] uppercase px-10 py-3 h-auto"
                >
                  Track
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TrackOrdersPage;
