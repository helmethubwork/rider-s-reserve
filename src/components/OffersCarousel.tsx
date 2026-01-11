import { Link } from "react-router-dom";
import { ArrowRight, Flame } from "lucide-react";
import ProductCard from "./ProductCard";
import { getBestsellers } from "@/data/products";

interface OffersCarouselProps {
  title?: string;
}

const OffersCarousel = ({ title = "UNBELIEVABLE OFFERS, JUST FOR YOU!" }: OffersCarouselProps) => {
  const products = getBestsellers().map((product, index) => ({
    ...product,
    badge: index === 0 ? "Sale" as const : index === 1 ? "Clearance Sale" as const : "Summer Special" as const,
  }));

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-foreground via-foreground to-muted relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full mb-6">
            <Flame size={18} className="animate-pulse" />
            <span className="text-sm font-bold tracking-wider uppercase">Hot Deals</span>
          </div>
          <h2 
            className="text-3xl md:text-5xl lg:text-6xl font-black text-background tracking-tight" 
            style={{ fontStyle: 'italic' }}
          >
            {title}
          </h2>
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="w-20 h-1 bg-primary rounded-full" />
          </div>
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="transform hover:-translate-y-2 transition-transform duration-300">
              <ProductCard
                id={product.id}
                name={product.name}
                price={product.price}
                originalPrice={product.originalPrice}
                image={product.image}
                rating={product.rating}
                reviewCount={product.reviewCount}
                brand={product.brand}
                badge={product.badge}
                isPreorder={product.isPreorder}
                isSoldOut={product.isSoldOut}
              />
            </div>
          ))}
        </div>

        {/* View all button */}
        <div className="flex justify-center mt-14">
          <Link
            to="/sale"
            className="group inline-flex items-center gap-3 border-2 border-background text-background font-bold px-10 py-4 text-sm tracking-[0.15em] rounded-lg hover:bg-background hover:text-foreground transition-all duration-500"
          >
            VIEW ALL OFFERS
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default OffersCarousel;
