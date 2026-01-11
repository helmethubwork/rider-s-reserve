import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const brands = [
  { name: "AXOR", slug: "axor" },
  { name: "LS2", slug: "ls2" },
  { name: "MT", slug: "mt" },
  { name: "KORDA", slug: "korda" },
  { name: "AXXIS", slug: "axxis" },
  { name: "NHK", slug: "nhk" },
  { name: "STUDDS", slug: "studds" },
  { name: "RYNOX", slug: "rynox" },
];

const BrandShowcase = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

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
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground tracking-wide mb-3">
            Brands We Collaborate With
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto">
            Helmet Hub has collaborated with the best in the market brands, giving you a perfect place to buy helmets and riding gear
          </p>
        </div>

        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={() => scroll('left')}
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 bg-foreground/90 hover:bg-foreground text-background rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
              !canScrollLeft ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
            }`}
            disabled={!canScrollLeft}
          >
            <ChevronLeft size={24} />
          </button>

          {/* Brands Carousel */}
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide px-14 md:px-16 py-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {brands.map((brand) => (
              <Link
                key={brand.name}
                to={`/brands/${brand.slug}`}
                className="flex-shrink-0 group"
              >
                <div className="w-40 h-24 md:w-52 md:h-32 bg-card border-4 border-primary rounded-sm flex items-center justify-center transition-all duration-300 group-hover:border-accent group-hover:shadow-[0_0_20px_hsl(var(--primary)/0.4)]">
                  <span className="text-lg md:text-2xl font-black text-foreground tracking-wider group-hover:text-primary transition-colors italic">
                    {brand.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Right Arrow */}
          <button
            onClick={() => scroll('right')}
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 bg-foreground/90 hover:bg-foreground text-background rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
              !canScrollRight ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
            }`}
            disabled={!canScrollRight}
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default BrandShowcase;
