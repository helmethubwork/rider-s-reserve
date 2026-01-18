import { Link } from "react-router-dom";
import { ArrowRight, Flame } from "lucide-react";
import ProductCard from "./ProductCard";
import { useFeaturedProducts } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";

interface OffersCarouselProps {
  title?: string;
}

const LoadingSkeleton = () => (
  <section className="py-12 sm:py-20 md:py-28 bg-gradient-to-b from-foreground via-foreground to-muted relative overflow-hidden">
    <div className="container mx-auto px-3 sm:px-4 relative z-10">
      <div className="text-center mb-8 sm:mb-14">
        <Skeleton className="h-8 w-32 mx-auto mb-4" />
        <Skeleton className="h-12 w-64 mx-auto" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  </section>
);

const OffersCarousel = ({ title = "UNBELIEVABLE OFFERS!" }: OffersCarouselProps) => {
  const { data: products = [], isLoading } = useFeaturedProducts(8);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-12 sm:py-20 md:py-28 bg-gradient-to-b from-foreground via-foreground to-muted relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-48 sm:w-96 h-48 sm:h-96 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-40 sm:w-80 h-40 sm:h-80 bg-accent rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-3 sm:px-4 relative z-10">
        {/* Section header */}
        <div className="text-center mb-8 sm:mb-14">
          <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-400 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-4 sm:mb-6 border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
            <Flame size={16} className="sm:w-[18px] sm:h-[18px] animate-pulse text-red-500" />
            <span className="text-xs sm:text-sm font-bold tracking-wider uppercase">Hot Deals</span>
          </div>
          <h2 
            className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-background tracking-tight px-2" 
            style={{ fontStyle: 'italic' }}
          >
            {title}
          </h2>
          <div className="flex items-center justify-center gap-2 mt-4 sm:mt-6">
            <div className="w-12 sm:w-20 h-1 bg-primary rounded-full" />
          </div>
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {products.map((product) => (
            <div key={product.id} className="transform hover:-translate-y-2 transition-transform duration-300">
              <ProductCard
                id={product.id}
                name={product.name}
                price={product.is_on_sale && product.sale_price ? product.sale_price : product.price}
                image={product.image_url || '/placeholder.svg'}
                badge={product.sale_badge as "Sale" | "Clearance Sale" | "Summer Special" | undefined}
                isSoldOut={product.stock === 0}
              />
            </div>
          ))}
        </div>

        {/* View all button */}
        <div className="flex justify-center mt-8 sm:mt-14">
          <Link
            to="/sale"
            className="group inline-flex items-center gap-2 sm:gap-3 border-2 border-background text-background font-bold px-6 sm:px-10 py-3 sm:py-4 text-xs sm:text-sm tracking-[0.15em] rounded-lg hover:bg-background hover:text-foreground transition-all duration-500 active:scale-95"
          >
            VIEW ALL OFFERS
            <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px] group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default OffersCarousel;
