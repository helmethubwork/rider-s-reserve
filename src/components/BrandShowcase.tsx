import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";

// Brand logos
import axorLogo from "@/assets/brands/axor-logo.png";
import ls2Logo from "@/assets/brands/ls2-logo.png";
import mtLogo from "@/assets/brands/mt-logo.png";
import kordaLogo from "@/assets/brands/korda-logo.png";
import axxisLogo from "@/assets/brands/axxis-logo.png";
import nhkLogo from "@/assets/brands/nhk-logo.png";
import studdsLogo from "@/assets/brands/studds-logo.png";
import rynoxLogo from "@/assets/brands/rynox-logo.png";

const brands = [
  { name: "AXOR", slug: "axor", logo: axorLogo },
  { name: "LS2", slug: "ls2", logo: ls2Logo },
  { name: "MT", slug: "mt", logo: mtLogo },
  { name: "KORDA", slug: "korda", logo: kordaLogo },
  { name: "AXXIS", slug: "axxis", logo: axxisLogo },
  { name: "NHK", slug: "nhk", logo: nhkLogo },
  { name: "STUDDS", slug: "studds", logo: studdsLogo },
  { name: "RYNOX", slug: "rynox", logo: rynoxLogo },
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
      const scrollAmount = window.innerWidth < 640 ? 200 : 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScroll, 350);
    }
  };

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
            className="flex gap-3 sm:gap-5 md:gap-6 overflow-x-auto scrollbar-hide px-12 sm:px-16 md:px-20 py-4"
          >
            {brands.map((brand) => (
              <Link
                key={brand.name}
                to={`/brands/${brand.slug}`}
                className="flex-shrink-0 group"
              >
                <div className="brand-card w-28 sm:w-44 md:w-56 h-20 sm:h-28 md:h-36">
                  <img 
                    src={brand.logo} 
                    alt={`${brand.name} logo`}
                    className="max-w-[75%] sm:max-w-[80%] max-h-[60%] sm:max-h-[70%] object-contain transition-all duration-500 group-hover:scale-110 filter brightness-90 group-hover:brightness-100"
                    loading="lazy"
                  />
                </div>
                <p className="text-center text-xs sm:text-sm font-medium text-muted-foreground mt-2 sm:mt-3 group-hover:text-primary transition-colors">
                  {brand.name}
                </p>
              </Link>
            ))}
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
