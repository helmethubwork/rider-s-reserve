import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Instagram, Play } from "lucide-react";
import { useInstagramPosts } from "@/hooks/useInstagramPosts";

const InstagramFeed = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: posts, isLoading } = useInstagramPosts();
  const [embedsLoaded, setEmbedsLoaded] = useState(false);
  
  // Extract reel IDs from posts
  const reelIds = posts?.map(p => p.reel_url) || [];

  // Load Instagram embed script
  useEffect(() => {
    if (reelIds.length === 0) return;

    const loadInstagramScript = () => {
      // Remove existing script if any
      const existingScript = document.querySelector('script[src*="instagram.com/embed.js"]');
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement("script");
      script.src = "https://www.instagram.com/embed.js";
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        // Give a small delay for script to initialize
        setTimeout(() => {
          if ((window as any).instgrm) {
            (window as any).instgrm.Embeds.process();
            setEmbedsLoaded(true);
          }
        }, 300);
      };

      return script;
    };

    const script = loadInstagramScript();

    return () => {
      if (script && document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [reelIds.length]);

  // Re-process embeds when reelIds change
  useEffect(() => {
    if ((window as any).instgrm && reelIds.length > 0) {
      setTimeout(() => {
        (window as any).instgrm.Embeds.process();
      }, 100);
    }
  }, [reelIds]);

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
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-tl from-orange-400/10 via-pink-500/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 mb-8 sm:mb-12 relative z-10">
        {/* Section header */}
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

      {/* Instagram Video Embeds */}
      <div className="relative px-2 sm:px-0">
        {/* Gradient fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-4 sm:w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-4 sm:w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        {/* Navigation Arrows - Centered on video cards */}
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
          {reelIds.map((reelId, index) => (
            <div 
              key={reelId} 
              className="flex-shrink-0 w-[280px] sm:w-[300px] md:w-[320px] lg:w-[340px] aspect-[9/16] overflow-hidden relative instagram-video-container rounded-xl sm:rounded-2xl border-2 border-border/30 hover:border-primary/50 shadow-2xl shadow-black/40 bg-card transition-all duration-500 hover:scale-[1.02] hover:shadow-primary/10"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Decorative gradient border effect */}
              <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-orange-400/20 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20" />
              
              {/* Loading placeholder */}
              {!embedsLoaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-orange-400/10 z-10">
                  <div className="w-14 sm:w-18 h-14 sm:h-18 rounded-full bg-background/90 backdrop-blur-md flex items-center justify-center mb-4 shadow-xl animate-pulse">
                    <Play className="w-6 h-6 sm:w-8 sm:h-8 text-primary ml-1" />
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground font-medium">Loading reel...</p>
                </div>
              )}
              
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
                  className="block w-full h-full"
                />
              </blockquote>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Button */}
      <div className="text-center mt-8 sm:mt-12 relative z-10">
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

      <style>{`
        .instagram-video-container {
          position: relative;
          overflow: hidden;
          background: #000;
          clip-path: inset(0 0 160px 0);
        }
        @media (min-width: 640px) {
          .instagram-video-container {
            clip-path: inset(0 0 200px 0);
          }
        }
        .instagram-video-container iframe {
          position: absolute !important;
          top: -50px !important;
          left: -1px !important;
          width: calc(100% + 2px) !important;
          height: calc(100% + 260px) !important;
          border: 0 !important;
        }
        @media (min-width: 640px) {
          .instagram-video-container iframe {
            top: -70px !important;
            height: calc(100% + 340px) !important;
          }
        }
        .instagram-video-container .instagram-media {
          min-width: 100% !important;
          width: 100% !important;
          background: transparent !important;
        }
        .instagram-video-container .instagram-media-rendered {
          background: transparent !important;
        }
      `}</style>
    </section>
  );
};

export default InstagramFeed;
