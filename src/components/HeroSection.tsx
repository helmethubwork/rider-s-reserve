import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-helmet.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[80vh] md:min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl animate-slide-up">
          <span className="badge-preorder mb-4 inline-block">
            🏍️ Preorder Now
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6">
            RIDE WITH
            <span className="text-gradient block">CONFIDENCE</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg">
            Premium motorcycle helmets and gear from top brands. 
            Preorder now and gear up for your next adventure.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/category/helmets">
              <Button size="lg" className="w-full sm:w-auto text-lg px-8 glow-yellow">
                Shop Helmets
                <ArrowRight size={20} className="ml-2" />
              </Button>
            </Link>
            <Link to="/latest-offers">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8">
                View Offers
              </Button>
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 flex flex-wrap items-center gap-8">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">100%</p>
              <p className="text-sm text-muted-foreground">Authentic Products</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">500+</p>
              <p className="text-sm text-muted-foreground">Happy Riders</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">24/7</p>
              <p className="text-sm text-muted-foreground">Support</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
