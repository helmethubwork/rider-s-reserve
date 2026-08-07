import { useRef } from "react";
import { ChevronLeft, ChevronRight, Instagram, Play } from "lucide-react";
import { useInstagramPosts } from "@/hooks/useInstagramPosts";

// Gradient palettes per card (cycles through)
const GRADIENTS = [
  "from-pink-600 via-purple-600 to-indigo-600",
  "from-orange-500 via-pink-600 to-purple-600",
  "from-purple-600 via-pink-500 to-orange-400",
  "from-indigo-500 via-purple-600 to-pink-500",
  "from-rose-500 via-orange-500 to-amber-500",
  "from-fuchsia-600 via-purple-500 to-pink-500",
  "from-violet-600 via-purple-600 to-fuchsia-500",
  "from-pink-500 via-rose-500 to-orange-500",
];

const InstagramFeed = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: posts, isLoading } = useInstagramPosts();

  const reelIds = posts?.map(p => p.reel_url) || [];

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const isMobile = window.innerWidth < 640;
      const scrollAmount = isMobile ? 290 : 340;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (isLoading) {
    return (
      <section className="py-10 sm:py-16 md:py-24 bg-secondary/30 overflow-hidden relative">
        <div className="container mx-auto px-3 sm:px-4 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
        </div>
      </section>
    );
  }

  if (reelIds.length === 0) {
    return null;
  }

  return (
    <section className="py-12 sm:py-20 md:py-28 bg-gradient-to-b from-background via-secondary/20 to-background overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-tl from-orange-400/10 via-pink-500/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 mb-8 sm:mb-12 relative z-10">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-pink-500 via-purple-500 to-orange-400 text-white px-5 sm:px-8 py-2.5 sm:py-3 rounded-full mb-5 sm:mb-8 shadow-xl shadow-purple-500/20 hover:shadow-purple-500/30 transition-shadow duration-300">
            <Instagram size={18} className="sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm font-bold tracking-wider uppercase">Follow Us</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-foreground tracking-tight mb-3 sm:mb-4">
            Join Our <span className="text-gradient">Insta Story</span>
          </h2>
          <a
            href="https://www.instagram.com/helmethub46"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 text-primary hover:text-accent transition-all duration-300 font-bold text-base sm:text-xl"
          >
            @HELMETHUB46
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
          </a>
        </div>
      </div>

      {/* Reel Cards */}
      <div className="relative px-2 sm:px-0">
        {/* Gradient fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-4 sm:w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-4 sm:w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        {/* Navigation Arrows */}
        <div className="absolute inset-0 flex items-center justify-between pointer-events-none z-20 px-2 sm:px-4 lg:px-6">
          <button
            onClick={() => scroll("left")}
            className="pointer-events-auto w-10 sm:w-12 h-10 sm:h-12 bg-background/90 backdrop-blur-md hover:bg-primary hover:text-primary-foreground rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 border border-border/50 group"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 group-hover:-translate-x-0.5" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="pointer-events-auto w-10 sm:w-12 h-10 sm:h-12 bg-background/90 backdrop-blur-md hover:bg-primary hover:text-primary-foreground rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 border border-border/50 group"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Scrollable Container */}
        <div
          ref={scrollRef}
          className="flex gap-3 sm:gap-5 lg:gap-6 overflow-x-auto scrollbar-hide scroll-smooth px-4 sm:px-16 lg:px-24 py-4"
        >
          {reelIds.map((reelId, index) => {
            const gradient = GRADIENTS[index % GRADIENTS.length];
            const reelUrl = `https://www.instagram.com/reel/${reelId}/`;
            return (
              <a
                key={reelId}
                href={reelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex-shrink-0 w-[240px] sm:w-[260px] md:w-[280px] lg:w-[300px] rounded-2xl overflow-hidden shadow-2xl shadow-black/40 border-2 border-white/10 hover:border-white/30 transition-all duration-300 hover:scale-[1.03] hover:shadow-purple-500/20 group bg-gradient-to-br ${gradient}`}
                style={{ aspectRatio: "9/16" }}
                aria-label={`Watch reel ${index + 1} on Instagram`}
              >
                <div className="w-full h-full flex flex-col items-center justify-between p-4 sm:p-5 relative">
                  {/* Top: Instagram branding */}
                  <div className="w-full flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                        <Instagram size={14} className="text-white sm:w-4 sm:h-4" />
                      </div>
                      <span className="text-white/90 font-semibold text-xs sm:text-sm">Reel</span>
                    </div>
                    <span className="text-white/60 text-xs font-medium">#{index + 1}</span>
                  </div>

                  {/* Center: Play button */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-2xl group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                      <Play className="w-7 h-7 sm:w-9 sm:h-9 text-white fill-white ml-1" />
                    </div>
                    <p className="text-white/80 text-xs sm:text-sm font-medium text-center">Tap to watch on Instagram</p>
                  </div>

                  {/* Bottom: Account name */}
                  <div className="w-full text-center">
                    <p className="text-white font-bold text-sm sm:text-base tracking-wide">@helmethub46</p>
                    <p className="text-white/60 text-xs mt-0.5">Helmet Hub</p>
                  </div>

                  {/* Overlay shimmer on hover */}
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* CTA Button */}
      <div className="text-center mt-4 sm:mt-8 relative z-10">
        <a
          href="https://www.instagram.com/helmethub46"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-gradient-to-r from-pink-500 via-purple-500 to-orange-400 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-sm sm:text-base shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105"
        >
          <Instagram size={20} />
          View All Reels
        </a>
      </div>
    </section>
  );
};

export default InstagramFeed;
