import { Link } from "react-router-dom";
import { ArrowRight, Flame } from "lucide-react";
import ProductCard from "./ProductCard";
import { useFeaturedProducts } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";

interface OffersCarouselProps {
  title?: string;
}

const LoadingSkeleton = () => (
  <section className="py-12 sm:py-16 md:py-20 bg-secondary/30">
    <div className="container mx-auto px-3 sm:px-4">
      <div className="text-center mb-8 sm:mb-12">
        <Skeleton className="h-6 w-24 mx-auto mb-3" />
        <Skeleton className="h-10 w-56 mx-auto" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-[16/18] w-full rounded-xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  </section>
);

const OffersCarousel = ({ title = "HOT DEALS" }: OffersCarouselProps) => {
  const { data: products = [], isLoading } = useFeaturedProducts(4);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-secondary/30">
      <div className="container mx-auto px-3 sm:px-4">
        {/* Section header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 text-destructive mb-3">
            <Flame size={18} className="animate-pulse" />
            <span className="text-xs font-bold tracking-widest uppercase">Limited Time</span>
            <Flame size={18} className="animate-pulse" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground tracking-tight">
            {title}
          </h2>
          <div className="w-16 h-1 bg-primary mx-auto mt-4 rounded-full" />
        </div>

        {/* Products grid - 4 columns */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.is_on_sale && product.sale_price ? product.sale_price : product.price}
              originalPrice={product.is_on_sale ? product.price : undefined}
              image={product.image_url || '/placeholder.svg'}
              badge={product.sale_badge as "Sale" | "Clearance Sale" | "Summer Special" | undefined}
              isSoldOut={product.stock === 0}
              stock={product.stock}
            />
          ))}
        </div>

        {/* View all link */}
        <div className="flex justify-center mt-8 sm:mt-10">
          <Link
            to="/sale"
            className="group inline-flex items-center gap-2 text-primary font-bold text-sm hover:underline underline-offset-4"
          >
            View All Offers
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default OffersCarousel;
