import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useFeaturedBrands } from "@/hooks/useBrands";
import { Skeleton } from "@/components/ui/skeleton";
import { brands as localBrands } from "@/data/brands";

const LoadingSkeleton = () => (
  <section className="py-12 sm:py-20 md:py-28 bg-background relative overflow-hidden">
    <div className="container mx-auto px-3 sm:px-4 relative z-10">
      <div className="text-center mb-8 sm:mb-14">
        <Skeleton className="h-4 w-32 mx-auto mb-4" />
        <Skeleton className="h-10 w-64 mx-auto mb-4" />
        <Skeleton className="h-4 w-96 mx-auto" />
      </div>
      <div className="flex gap-4 sm:gap-6 md:gap-8 overflow-hidden px-12 sm:px-16 md:px-20 py-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex-shrink-0">
            <Skeleton className="w-44 sm:w-56 md:w-72 lg:w-80 h-36 sm:h-44 md:h-52 lg:h-56 rounded-2xl" />
            <Skeleton className="h-4 w-24 mx-auto mt-4" />
          </div>
        ))}
      </div>
    </div>
  </section>
);

// Helper to get local logo by slug
const getLocalLogo = (slug: string): string | null => {
  const localBrand = localBrands.find(b => b.slug === slug);
  return localBrand?.logo || null;
};

const BrandShowcase = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  const { data: dbBrands = [], isLoading } = useFeaturedBrands();

  // Merge database brands with local logos as fallback
  const brands = dbBrands.length > 0 
    ? dbBrands.map(brand => ({
        ...brand,
        logo_url: brand.logo_url || getLocalLogo(brand.slug)
      }))
    : localBrands.filter(b => b.featured).map(b => ({
        id: b.slug,
        name: b.name,
        slug: b.slug,
        logo_url: b.logo,
        description: b.description,
        is_featured: true,
        is_active: true,
        display_order: 0,
        created_at: ''
      }));

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [brands]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = window.innerWidth < 640 ? 200 : 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScroll, 350);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (brands.length === 0) {
    return null;
  }

  return (
    <section className="py-12 sm:py-20 md:py-28 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[800px] h-[200px] sm:h-[400px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-3 sm:px-4 relative z-10">
        {/* Section header */}
        <div className="text-center mb-8 sm:mb-14">
          <span className="text-primary text-xs sm:text-sm font-bold tracking-[0.2em] sm:tracking-[0.3em] uppercase mb-3 sm:mb-4 block">
            Trusted Partners
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-foreground tracking-tight mb-3 sm:mb-4">
            Brands We Collaborate With
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4">
            Premium quality helmets and riding gear from world's leading brands
          </p>
          <div className="flex items-center justify-center gap-2 mt-4 sm:mt-6">
            <div className="w-10 sm:w-16 h-1 bg-primary rounded-full" />
            <div className="w-2 sm:w-3 h-2 sm:h-3 bg-primary rounded-full" />
            <div className="w-10 sm:w-16 h-1 bg-primary rounded-full" />
          </div>
        </div>

        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={() => scroll('left')}
            className={`absolute -left-1 sm:-left-2 md:left-0 top-1/2 -translate-y-1/2 z-10 w-10 sm:w-12 md:w-14 h-10 sm:h-12 md:h-14 bg-card/90 backdrop-blur-sm hover:bg-primary text-foreground hover:text-primary-foreground rounded-full flex items-center justify-center transition-all duration-300 shadow-lg border border-border ${
              !canScrollLeft ? 'opacity-40 cursor-not-allowed' : 'hover:scale-110 hover:shadow-xl active:scale-95'
            }`}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
          </button>

          {/* Brands Carousel */}
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex gap-4 sm:gap-6 md:gap-8 overflow-x-auto scrollbar-hide px-12 sm:px-16 md:px-20 py-6"
          >
            {brands.map((brand) => (
              <Link
                key={brand.id}
                to={`/brands/${brand.slug}`}
                className="flex-shrink-0 group"
              >
                <div className="w-44 sm:w-56 md:w-72 lg:w-80 h-36 sm:h-44 md:h-52 lg:h-56 bg-gradient-to-br from-card via-card to-secondary border-2 border-primary/40 rounded-2xl flex items-center justify-center p-6 transition-all duration-500 hover:border-primary hover:shadow-[0_0_40px_rgba(200,255,50,0.25)] hover:scale-105 group-hover:bg-secondary/80">
                  <img 
                    src={brand.logo_url || '/placeholder.svg'} 
                    alt={`${brand.name} logo`}
                    className="max-w-[90%] max-h-[85%] object-contain transition-all duration-500 group-hover:scale-110 filter brightness-90 group-hover:brightness-110"
                    loading="lazy"
                  />
                </div>
                <p className="text-center text-sm sm:text-base md:text-lg font-bold text-muted-foreground mt-3 sm:mt-4 group-hover:text-primary transition-colors tracking-wide">
                  {brand.name}
                </p>
              </Link>
            ))}
            
            {/* More Brands Card */}
            <Link
              to="/brands"
              className="flex-shrink-0 group"
            >
              <div className="w-44 sm:w-56 md:w-72 lg:w-80 h-36 sm:h-44 md:h-52 lg:h-56 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 border-2 border-primary rounded-2xl flex flex-col items-center justify-center p-6 transition-all duration-500 hover:bg-primary hover:shadow-[0_0_40px_rgba(200,255,50,0.4)] hover:scale-105">
                <ArrowRight size={48} className="text-primary group-hover:text-primary-foreground transition-colors mb-2" />
                <span className="text-lg sm:text-xl md:text-2xl font-bold text-primary group-hover:text-primary-foreground transition-colors">
                  View All
                </span>
              </div>
              <p className="text-center text-sm sm:text-base md:text-lg font-bold text-primary mt-3 sm:mt-4 group-hover:text-accent transition-colors tracking-wide">
                MORE BRANDS
              </p>
            </Link>
            
          </div>

          {/* Right Arrow */}
          <button
            onClick={() => scroll('right')}
            className={`absolute -right-1 sm:-right-2 md:right-0 top-1/2 -translate-y-1/2 z-10 w-10 sm:w-12 md:w-14 h-10 sm:h-12 md:h-14 bg-card/90 backdrop-blur-sm hover:bg-primary text-foreground hover:text-primary-foreground rounded-full flex items-center justify-center transition-all duration-300 shadow-lg border border-border ${
              !canScrollRight ? 'opacity-40 cursor-not-allowed' : 'hover:scale-110 hover:shadow-xl active:scale-95'
            }`}
            disabled={!canScrollRight}
            aria-label="Scroll right"
          >
            <ChevronRight size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default BrandShowcase;
