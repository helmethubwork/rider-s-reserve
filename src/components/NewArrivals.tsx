import { useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import ProductCard from "./ProductCard";
import SwipeHint from "./SwipeHint";
import { useFeaturedProducts } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";

const LoadingSkeleton = () => (
  <section className="py-12 sm:py-20 bg-background">
    <div className="container mx-auto px-4">
      <Skeleton className="h-9 w-56 mx-auto mb-10" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-square w-full rounded-xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  </section>
);

const NewArrivals = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: products = [], isLoading } = useFeaturedProducts(8);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = window.innerWidth < 640 ? 200 : 300;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (isLoading) return <LoadingSkeleton />;
  if (products.length === 0) return null;

  return (
    <section className="py-12 sm:py-20 md:py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Eyebrow */}
        <div className="flex justify-center mb-3">
          <span className="inline-flex items-center gap-2 text-primary text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.18em] bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full">
            <Sparkles size={13} />
            Just Landed
          </span>
        </div>

        {/* Heading with arrows */}
        <div className="flex items-center justify-center gap-3 sm:gap-5 mb-2">
          <button
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center border border-border/60 text-muted-foreground hover:text-primary hover:border-primary/60 hover:bg-primary/5 transition-all duration-200 active:scale-90 flex-shrink-0"
          >
            <ChevronLeft size={20} />
          </button>

          <h2 className="text-xl sm:text-3xl md:text-[2.4rem] font-black text-foreground text-center leading-none tracking-tightest whitespace-nowrap">
            New <span className="text-gradient">Arrivals</span>
          </h2>

          <button
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center border border-border/60 text-muted-foreground hover:text-primary hover:border-primary/60 hover:bg-primary/5 transition-all duration-200 active:scale-90 flex-shrink-0"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* View all */}
        <div className="text-center mb-8 sm:mb-11">
          <Link
            to="/category/all"
            className="text-primary hover:text-accent text-[11px] sm:text-xs font-bold uppercase tracking-[0.15em] underline underline-offset-4 transition-colors"
          >
            View All
          </Link>
        </div>

        {/* Products — horizontal scroll on mobile, grid on desktop */}
        <div
          ref={scrollRef}
          className="flex lg:grid lg:grid-cols-4 gap-3 sm:gap-5 overflow-x-auto lg:overflow-visible scrollbar-hide scroll-smooth pb-2 -mx-4 px-4 lg:mx-0 lg:px-0"
        >
          {products.slice(0, 8).map((product) => (
            <div
              key={product.id}
              className="w-[46vw] sm:w-[38vw] md:w-[30vw] lg:w-auto flex-shrink-0 lg:flex-shrink"
            >
              <ProductCard
                id={product.id}
                name={product.name}
                price={product.is_on_sale && product.sale_price ? product.sale_price : product.price}
                image={product.image_url || "/placeholder.svg"}
                badge={product.sale_badge as "Sale" | "Clearance Sale" | "Summer Special" | "New" | undefined}
                isSoldOut={product.stock === 0}
                colors={product.colors || []}
              />
            </div>
          ))}
        </div>

        <SwipeHint hideAbove="lg" />
      </div>
    </section>
  );
};

export default NewArrivals;
