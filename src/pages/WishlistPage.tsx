import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PromoBanner from "@/components/PromoBanner";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

const WishlistPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PromoBanner />
      
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">
            Your Wishlist
          </h1>

          <div className="text-center py-20">
            <Heart size={64} className="mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-muted-foreground mb-6">
              Save items you love for later!
            </p>
            <Button asChild>
              <a href="/category/helmets">Browse Products</a>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default WishlistPage;
