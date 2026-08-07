import { useRef } from "react";
import { ChevronLeft, ChevronRight, Instagram } from "lucide-react";
import { useInstagramPosts } from "@/hooks/useInstagramPosts";

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
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-tl from-orange-400/10 via-pink-500/10 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Section header */}
      <div className="container mx-auto px-4 sm:px-6 mb-8 sm:mb-12 relative z-10">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-pink-500 via-purple-500 to-orange-400 text-white px-5 sm:px-8 py-2.5 sm:py-3 rounded-full mb-5 sm:mb-8 shadow-xl shadow-purple-500/20">
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

      {/* Reel Embeds */}
      <div className="relative px-2 sm:px-0">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-4 sm:w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-4 sm:w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        {/* Navigation Arrows */}
        <div className="absolute inset-0 flex items-center justify-between pointer-events-none z-20 px-2 sm:px-4 lg:px-6">
          <button
            onClick={() => scroll("left")}
            className="pointer-events-auto w-10 sm:w-12 h-10 sm:h-12 bg-background/90 backdrop-blur-md hover:bg-primary hover:text-primary-foreground rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 border border-border/50 group"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="pointer-events-auto w-10 sm:w-12 h-10 sm:h-12 bg-background/90 backdrop-blur-md hover:bg-primary hover:text-primary-foreground rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 border border-border/50 group"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Scrollable Reel Row */}
        <div
          ref={scrollRef}
          className="flex gap-3 sm:gap-5 lg:gap-6 overflow-x-auto scrollbar-hide scroll-smooth px-4 sm:px-16 lg:px-24 py-4"
        >
          {reelIds.map((reelId, index) => (
            <div
              key={reelId}
              className="reel-card flex-shrink-0 w-[260px] sm:w-[280px] md:w-[300px] lg:w-[320px] rounded-xl sm:rounded-2xl shadow-2xl shadow-black/50 border border-border/40 hover:border-primary/50 bg-black transition-all duration-300 hover:scale-[1.02] hover:shadow-primary/10"
            >
              {/* Direct Instagram embed iframe — no embed.js needed */}
              <iframe
                src={`https://www.instagram.com/reel/${reelId}/embed/captioned/`}
                className="reel-iframe"
                scrolling="no"
                frameBorder="0"
                allowTransparency={true}
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                loading={index < 3 ? "eager" : "lazy"}
                title={`Helmet Hub Reel ${index + 1}`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center mt-4 sm:mt-8 relative z-10">
        <a
          href="https://www.instagram.com/helmethub46"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-gradient-to-r from-pink-500 via-purple-500 to-orange-400 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-sm sm:text-base shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105"
        >
          <Instagram size={20} />
          View All Reels on Instagram
        </a>
      </div>

      <style>{`
        /* Each card clips Instagram's header/footer chrome — shows just the video */
        .reel-card {
          position: relative;
          overflow: hidden;
          /* aspect: ~9/14 — taller than standard to fit the captioned embed cleanly */
          aspect-ratio: 9 / 14;
        }

        .reel-iframe {
          /* Make iframe fill container + extend beyond to clip Instagram chrome */
          position: absolute;
          top: -2px;
          left: -2px;
          width: calc(100% + 4px);
          /* Taller than container so overflow:hidden clips the bottom actions bar */
          height: calc(100% + 4px);
          border: 0;
          background: #000;
        }
      `}</style>
    </section>
  );
};

export default InstagramFeed;
