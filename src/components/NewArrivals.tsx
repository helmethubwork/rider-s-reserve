import { useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Flame, ArrowRight } from "lucide-react";
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

const UnbelievableOffers = () => {
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
            <Flame size={13} />
            Hot Deals
          </span>
        </div>

        {/* Heading with arrows */}
        <div className="flex items-center justify-center gap-3 sm:gap-5 mb-9 sm:mb-12">
          <button
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center border border-border/60 text-muted-foreground hover:text-primary hover:border-primary/60 hover:bg-primary/5 transition-all duration-200 active:scale-90 flex-shrink-0"
          >
            <ChevronLeft size={20} />
          </button>

          <h2 className="text-lg sm:text-3xl md:text-[2.4rem] font-black text-foreground text-center leading-none tracking-tightest whitespace-nowrap">
            Unbelievable <span className="text-gradient">Offers</span>
          </h2>

          <button
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center border border-border/60 text-muted-foreground hover:text-primary hover:border-primary/60 hover:bg-primary/5 transition-all duration-200 active:scale-90 flex-shrink-0"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Products — horizontal swipe carousel at every breakpoint */}
        <div
          ref={scrollRef}
          className="flex gap-3 sm:gap-5 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory pb-2 -mx-4 px-4"
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="w-[46vw] sm:w-[31vw] md:w-[23vw] lg:w-[calc(25%-15px)] flex-shrink-0 snap-start"
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

        {/* View all — sits below the carousel */}
        <div className="flex justify-center mt-8 sm:mt-11">
          <Link
            to="/sale"
            className="group inline-flex items-center gap-2.5 border-2 border-border hover:border-primary text-foreground hover:text-primary font-bold px-7 sm:px-9 py-3 sm:py-3.5 text-[11px] sm:text-xs tracking-[0.15em] uppercase rounded-lg transition-all duration-300 active:scale-95"
          >
            View All Offers
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default UnbelievableOffers;
