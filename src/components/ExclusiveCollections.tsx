import { useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";
import { useCollections } from "@/hooks/useCollections";
import { Skeleton } from "@/components/ui/skeleton";
import SwipeHint from "@/components/SwipeHint";

const LoadingSkeleton = () => (
  <section className="py-14 sm:py-20 bg-background">
    <div className="container mx-auto px-4">
      <Skeleton className="h-10 w-72 mx-auto mb-10" />
      <div className="flex gap-8 justify-center">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col items-center gap-4">
            <Skeleton className="w-32 h-32 sm:w-44 sm:h-44 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  </section>
);

const ExclusiveCollections = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: collections = [], isLoading } = useCollections();

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = window.innerWidth < 640 ? 170 : 240;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (isLoading) return <LoadingSkeleton />;
  if (collections.length === 0) return null;

  return (
    <section className="relative py-14 sm:py-20 md:py-24 bg-background overflow-hidden">
      {/* Ambient glow so the section doesn't read as flat black */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[42rem] h-64 bg-primary/[0.07] rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Eyebrow */}
        <div className="flex justify-center mb-3">
          <span className="inline-flex items-center gap-2 text-primary text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.18em] bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full">
            <ShieldCheck size={13} />
            Find Your Fit
          </span>
        </div>

        {/* Heading with arrows */}
        <div className="flex items-center justify-center gap-3 sm:gap-5 mb-3">
          <button
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center border border-border/60 text-muted-foreground hover:text-primary hover:border-primary/60 hover:bg-primary/5 transition-all duration-200 active:scale-90 flex-shrink-0"
          >
            <ChevronLeft size={20} />
          </button>

          <h2 className="text-xl sm:text-3xl md:text-[2.6rem] font-black text-foreground text-center leading-none tracking-tightest whitespace-nowrap">
            Gear Up Your <span className="text-gradient">Way</span>
          </h2>

          <button
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center border border-border/60 text-muted-foreground hover:text-primary hover:border-primary/60 hover:bg-primary/5 transition-all duration-200 active:scale-90 flex-shrink-0"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Supporting line */}
        <p className="text-center text-muted-foreground text-xs sm:text-sm max-w-md mx-auto mb-10 sm:mb-14">
          Every budget, every standard — pick the protection that suits your ride.
        </p>

        {/* Circular collection cards */}
        <div
          ref={scrollRef}
          className="flex gap-6 sm:gap-10 md:gap-14 overflow-x-auto scrollbar-hide scroll-smooth pb-3 px-2 justify-start lg:justify-center"
        >
          {collections.map((collection) => (
            <Link
              key={collection.id}
              to={`/collection/${collection.slug}`}
              className="group flex flex-col items-center gap-4 flex-shrink-0 outline-none"
            >
              {/* Circle */}
              <div className="relative">
                {/* Soft glow behind, only on hover */}
                <div className="absolute inset-0 rounded-full bg-primary/25 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-90" />

                {/* Gradient ring frame */}
                <div className="relative p-[2px] rounded-full bg-gradient-to-br from-border via-border/40 to-border group-hover:from-primary group-hover:via-accent group-hover:to-primary transition-all duration-500">
                  <div className="w-28 h-28 sm:w-40 sm:h-40 md:w-44 md:h-44 rounded-full overflow-hidden bg-gradient-to-br from-secondary to-card relative">
                    {collection.image_url ? (
                      <img
                        src={collection.image_url}
                        alt={collection.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      />
                    ) : (
                      /* Branded placeholder instead of a plain grey circle */
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-secondary via-card to-background">
                        <ShieldCheck
                          size={30}
                          className="text-primary/35 mb-1 transition-transform duration-500 group-hover:scale-110"
                        />
                        <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50">
                          Helmet Hub
                        </span>
                      </div>
                    )}

                    {/* Inner shading for depth */}
                    <div className="absolute inset-0 rounded-full shadow-[inset_0_-14px_30px_rgba(0,0,0,0.45)] pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Label */}
              <div className="flex flex-col items-center gap-1.5">
                <span className="text-[13px] sm:text-[15px] font-bold text-foreground text-center max-w-[8rem] sm:max-w-[11rem] leading-snug tracking-[-0.01em] group-hover:text-primary transition-colors duration-300">
                  {collection.name}
                </span>
                {/* Underline that grows on hover */}
                <span className="h-[2px] w-0 group-hover:w-8 bg-primary rounded-full transition-all duration-300" />
              </div>
            </Link>
          ))}
        </div>

        {/* Swipe hint — mobile only, where the row actually overflows */}
        <SwipeHint hideAbove="lg" />
      </div>
    </section>
  );
};

export default ExclusiveCollections;
