import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Instagram } from "lucide-react";
import { instagramReelIds } from "@/data/instagramReels";

const InstagramFeed = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Use hardcoded reels for reliable production deployment
  const reelIds = instagramReelIds;

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.instagram.com/embed.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      if ((window as any).instgrm) {
        (window as any).instgrm.Embeds.process();
      }
    };

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 340;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-10 sm:py-16 md:py-24 bg-secondary/30 overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-50">
        <div className="absolute top-5 sm:top-10 right-10 sm:right-20 w-24 sm:w-40 h-24 sm:h-40 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-5 sm:bottom-10 left-10 sm:left-20 w-32 sm:w-60 h-32 sm:h-60 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-3 sm:px-4 mb-6 sm:mb-10 relative z-10">
        {/* Section header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-pink-500 via-purple-500 to-orange-400 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full mb-4 sm:mb-6 shadow-lg">
            <Instagram size={16} className="sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm font-bold tracking-wider uppercase">Follow Us</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-4xl font-black text-foreground tracking-tight mb-2">
            Join Our Insta Story
          </h2>
          <a 
            href="https://www.instagram.com/helmethub46" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:text-accent transition-colors font-bold text-sm sm:text-lg"
          >
            @HELMETHUB46
          </a>
        </div>
      </div>

      {/* Instagram Video Embeds */}
      <div className="relative">
        {/* Left Arrow */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-9 sm:w-12 h-9 sm:h-12 bg-background/90 backdrop-blur-sm hover:bg-primary rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 border border-border"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6 text-foreground" />
        </button>

        {/* Right Arrow */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 z-10 w-9 sm:w-12 h-9 sm:h-12 bg-background/90 backdrop-blur-sm hover:bg-primary rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 border border-border"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6 text-foreground" />
        </button>

        {/* Scrollable Container */}
        <div 
          ref={scrollRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-4 sm:px-8"
        >
          {reelIds.map((reelId) => (
            <div 
              key={reelId} 
              className="flex-shrink-0 w-[240px] sm:w-[300px] md:w-[340px] aspect-[4/5] overflow-hidden relative instagram-video-container rounded-lg sm:rounded-xl border border-border/50 shadow-lg"
            >
              <blockquote
                className="instagram-media"
                data-instgrm-permalink={`https://www.instagram.com/reel/${reelId}/`}
                data-instgrm-version="14"
                style={{
                  background: "transparent",
                  border: 0,
                  margin: 0,
                  padding: 0,
                  width: "100%",
                  maxWidth: "100%",
                }}
              >
                <a
                  href={`https://www.instagram.com/reel/${reelId}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full h-full bg-card"
                />
              </blockquote>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .instagram-video-container {
          position: relative;
          overflow: hidden;
          background: hsl(var(--card));
        }
        .instagram-video-container iframe {
          position: absolute !important;
          top: -64px !important;
          left: 0 !important;
          width: 100% !important;
          height: calc(100% + 240px) !important;
          border: 0 !important;
          background: hsl(var(--card)) !important;
        }
        .instagram-video-container .instagram-media {
          min-width: 100% !important;
          width: 100% !important;
          background: hsl(var(--card)) !important;
        }
        .instagram-video-container .instagram-media-rendered {
          background: hsl(var(--card)) !important;
        }
      `}</style>
    </section>
  );
};

export default InstagramFeed;
