import { useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCollections } from "@/hooks/useCollections";
import { Skeleton } from "@/components/ui/skeleton";

const LoadingSkeleton = () => (
  <section className="py-10 sm:py-16 bg-background">
    <div className="container mx-auto px-4">
      <Skeleton className="h-9 w-64 mx-auto mb-8" />
      <div className="flex gap-6 justify-center">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col items-center gap-3">
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
    const amount = window.innerWidth < 640 ? 160 : 220;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (isLoading) return <LoadingSkeleton />;
  if (collections.length === 0) return null;

  return (
    <section className="py-10 sm:py-16 md:py-20 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header with inline arrows */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 mb-8 sm:mb-12">
          <button
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-secondary transition-all duration-200 active:scale-90 flex-shrink-0"
          >
            <ChevronLeft size={22} />
          </button>

          <h2 className="text-xl sm:text-3xl md:text-4xl font-black text-foreground tracking-tightest text-center whitespace-nowrap">
            Exclusive Collections
          </h2>

          <button
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-secondary transition-all duration-200 active:scale-90 flex-shrink-0"
          >
            <ChevronRight size={22} />
          </button>
        </div>

        {/* Circular collection cards */}
        <div
          ref={scrollRef}
          className="flex gap-5 sm:gap-8 md:gap-10 overflow-x-auto scrollbar-hide scroll-smooth pb-2 px-1 justify-start lg:justify-center"
        >
          {collections.map((collection) => (
            <Link
              key={collection.id}
              to={`/collection/${collection.slug}`}
              className="group flex flex-col items-center gap-3 sm:gap-4 flex-shrink-0"
            >
              {/* Circle image */}
              <div className="relative">
                <div className="w-28 h-28 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full overflow-hidden bg-secondary ring-2 ring-transparent group-hover:ring-primary transition-all duration-300 shadow-lg group-hover:shadow-[0_10px_35px_-8px_hsl(50_100%_50%/0.45)] group-hover:-translate-y-1">
                  <img
                    src={collection.image_url || "/placeholder.svg"}
                    alt={collection.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                </div>
              </div>

              {/* Label */}
              <span className="text-[13px] sm:text-[15px] font-bold text-foreground text-center max-w-[8rem] sm:max-w-[11rem] leading-snug tracking-[-0.01em] group-hover:text-primary transition-colors duration-200">
                {collection.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExclusiveCollections;
