import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import helmet1 from "@/assets/products/helmet-1.jpg";
import helmet2 from "@/assets/products/helmet-2.jpg";
import helmet3 from "@/assets/products/helmet-3.jpg";
import visor1 from "@/assets/products/visor-1.jpg";
import intercom1 from "@/assets/products/intercom-1.jpg";
import jacket1 from "@/assets/products/jacket-1.jpg";

const instagramReels = [
  { id: 1, image: helmet1, reelId: "C-C3abzBKYd" },
  { id: 2, image: helmet2, reelId: "C6YW6r6LI9-" },
  { id: 3, image: helmet3, reelId: "DTNVmDwgTon" },
  { id: 4, image: visor1, reelId: "DRzgIPrjMNT" },
  { id: 5, image: intercom1, reelId: "DRUl9StDEsX" },
  { id: 6, image: jacket1, reelId: "DPngJf0Af1H" },
];

const InstagramFeed = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4 mb-8">
        <h2 className="text-center text-sm md:text-base tracking-[0.3em] text-foreground font-medium">
          JOIN OUR INSTA STORY:{" "}
          <a 
            href="https://www.instagram.com/helmethub46" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            @HELMETHUB46
          </a>
        </h2>
      </div>

      {/* Instagram Thumbnails Carousel */}
      <div className="relative">
        {/* Left Arrow */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>

        {/* Right Arrow */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5 text-foreground" />
        </button>

        {/* Scrollable Container */}
        <div 
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {instagramReels.map((reel) => (
            <a
              key={reel.id}
              href={`https://www.instagram.com/reel/${reel.reelId}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 w-[280px] md:w-[320px] aspect-[4/5] overflow-hidden group relative"
            >
              <img
                src={reel.image}
                alt={`Instagram reel ${reel.id}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Hover overlay with play icon */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
                  <svg 
                    className="w-6 h-6 text-foreground ml-1"
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};

export default InstagramFeed;
