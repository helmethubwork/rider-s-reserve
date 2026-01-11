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
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScroll, 350);
    }
  };

  return (
    <section className="py-20 md:py-28 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <div className="text-center mb-14">
          <span className="text-primary text-sm font-bold tracking-[0.3em] uppercase mb-4 block">
            Trusted Partners
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground tracking-tight mb-4">
            Brands We Collaborate With
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            Helmet Hub has partnered with the world's leading brands to bring you premium quality helmets and riding gear
          </p>
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="w-16 h-1 bg-primary rounded-full" />
            <div className="w-3 h-3 bg-primary rounded-full" />
            <div className="w-16 h-1 bg-primary rounded-full" />
          </div>
        </div>

        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={() => scroll('left')}
            className={`absolute -left-2 md:left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 md:w-14 md:h-14 bg-card/90 backdrop-blur-sm hover:bg-primary text-foreground hover:text-primary-foreground rounded-full flex items-center justify-center transition-all duration-300 shadow-lg border border-border ${
              !canScrollLeft ? 'opacity-40 cursor-not-allowed' : 'hover:scale-110 hover:shadow-xl'
            }`}
            disabled={!canScrollLeft}
          >
            <ChevronLeft size={24} />
          </button>

          {/* Brands Carousel */}
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex gap-5 md:gap-6 overflow-x-auto scrollbar-hide px-16 md:px-20 py-4"
          >
            {brands.map((brand) => (
              <Link
                key={brand.name}
                to={`/brands/${brand.slug}`}
                className="flex-shrink-0 group"
              >
                <div className="brand-card w-44 h-28 md:w-56 md:h-36">
                  <img 
                    src={brand.logo} 
                    alt={`${brand.name} logo`}
                    className="max-w-[80%] max-h-[70%] object-contain transition-all duration-500 group-hover:scale-110 filter brightness-90 group-hover:brightness-100"
                  />
                </div>
                <p className="text-center text-sm font-medium text-muted-foreground mt-3 group-hover:text-primary transition-colors">
                  {brand.name}
                </p>
              </Link>
            ))}
          </div>

          {/* Right Arrow */}
          <button
            onClick={() => scroll('right')}
            className={`absolute -right-2 md:right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 md:w-14 md:h-14 bg-card/90 backdrop-blur-sm hover:bg-primary text-foreground hover:text-primary-foreground rounded-full flex items-center justify-center transition-all duration-300 shadow-lg border border-border ${
              !canScrollRight ? 'opacity-40 cursor-not-allowed' : 'hover:scale-110 hover:shadow-xl'
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
