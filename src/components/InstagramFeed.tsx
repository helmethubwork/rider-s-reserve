import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Instagram, Play, ArrowRight } from "lucide-react";
import { useInstagramPosts } from "@/hooks/useInstagramPosts";
import { Button } from "@/components/ui/button";

const InstagramFeed = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: posts, isLoading } = useInstagramPosts();
  const [embedsLoaded, setEmbedsLoaded] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  const reelIds = posts?.map(p => p.reel_url) || [];

  // Check scroll position for button visibility
  const checkScrollPosition = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', checkScrollPosition);
      checkScrollPosition();
      return () => scrollElement.removeEventListener('scroll', checkScrollPosition);
    }
  }, [reelIds.length]);

  useEffect(() => {
    if (reelIds.length === 0) return;

    const loadInstagramScript = () => {
      const existingScript = document.querySelector('script[src*="instagram.com/embed.js"]');
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement("script");
      script.src = "https://www.instagram.com/embed.js";
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
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

  useEffect(() => {
    if ((window as any).instgrm && reelIds.length > 0) {
      setTimeout(() => {
        (window as any).instgrm.Embeds.process();
      }, 100);
    }
  }, [reelIds]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (isLoading) {
    return (
      <section className="py-8 sm:py-12 md:py-16 bg-secondary/30 overflow-hidden relative">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
        </div>
      </section>
    );
  }

  if (reelIds.length === 0) {
    return null;
  }

  return (
    <section className="py-10 sm:py-14 md:py-20 bg-gradient-to-b from-background via-secondary/10 to-background overflow-hidden relative">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-1/4 w-64 sm:w-80 h-64 sm:h-80 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-48 sm:w-64 h-48 sm:h-64 bg-gradient-to-tl from-primary/5 via-accent/5 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Section Header */}
      <div className="container mx-auto px-4 sm:px-6 mb-6 sm:mb-10 relative z-10">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-4 sm:px-6 py-2 rounded-full mb-4 sm:mb-6">
            <Instagram size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="text-xs sm:text-sm font-semibold tracking-wide uppercase">Follow Us</span>
          </div>
          
          <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-foreground tracking-tight mb-2 sm:mb-3">
            Join Our <span className="text-primary">Instagram</span> Community
          </h2>
          
          <a 
            href="https://www.instagram.com/helmethub46" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors duration-300 font-medium text-sm sm:text-base"
          >
            @HELMETHUB46
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative px-4 sm:px-8 md:px-12 lg:px-16">
        {/* Navigation Buttons */}
        <Button
          onClick={() => scroll("left")}
          variant="outline"
          size="icon"
          disabled={!canScrollLeft}
          className={`absolute left-1 sm:left-2 md:left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 
            w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 
            rounded-full border-2 border-primary/30 bg-background/95 backdrop-blur-sm
            hover:bg-primary hover:text-primary-foreground hover:border-primary hover:scale-110
            disabled:opacity-30 disabled:hover:scale-100 disabled:hover:bg-background/95 disabled:hover:border-primary/30
            shadow-lg transition-all duration-300`}
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>

        <Button
          onClick={() => scroll("right")}
          variant="outline"
          size="icon"
          disabled={!canScrollRight}
          className={`absolute right-1 sm:right-2 md:right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 
            w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 
            rounded-full border-2 border-primary/30 bg-background/95 backdrop-blur-sm
            hover:bg-primary hover:text-primary-foreground hover:border-primary hover:scale-110
            disabled:opacity-30 disabled:hover:scale-100 disabled:hover:bg-background/95 disabled:hover:border-primary/30
            shadow-lg transition-all duration-300`}
          aria-label="Scroll right"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>

        {/* Gradient Fade Edges */}
        <div className="absolute left-0 top-0 bottom-0 w-6 sm:w-12 md:w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-6 sm:w-12 md:w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        {/* Scrollable Reels */}
        <div 
          ref={scrollRef}
          className="flex gap-3 sm:gap-4 md:gap-5 overflow-x-auto scrollbar-hide scroll-smooth px-6 sm:px-12 md:px-16 lg:px-20 py-2"
        >
          {reelIds.map((reelId, index) => (
            <div 
              key={reelId} 
              className="flex-shrink-0 w-[180px] sm:w-[220px] md:w-[260px] lg:w-[300px] aspect-[9/16] 
                overflow-hidden relative instagram-video-container rounded-lg sm:rounded-xl 
                border border-border/50 hover:border-primary/40 
                shadow-lg hover:shadow-xl hover:shadow-primary/10 
                bg-card transition-all duration-300 hover:scale-[1.02]"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Loading Placeholder */}
              {!embedsLoaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-secondary/50 to-secondary/30 z-10">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center mb-3 shadow-lg animate-pulse">
                    <Play className="w-5 h-5 sm:w-6 sm:h-6 text-primary ml-0.5" />
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">Loading...</p>
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
      <div className="text-center mt-6 sm:mt-8 md:mt-10 relative z-10 px-4">
        <Button
          asChild
          className="bg-gradient-to-r from-pink-500 via-purple-500 to-orange-400 hover:from-pink-600 hover:via-purple-600 hover:to-orange-500 
            text-white border-0 px-5 sm:px-7 py-2.5 sm:py-3 h-auto text-xs sm:text-sm 
            shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <a
            href="https://www.instagram.com/helmethub46"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2"
          >
            <Instagram size={16} className="sm:w-[18px] sm:h-[18px]" />
            View All Reels
          </a>
        </Button>
      </div>

      <style>{`
        .instagram-video-container {
          position: relative;
          overflow: hidden;
          background: hsl(var(--card));
          clip-path: inset(0 0 200px 0);
        }
        .instagram-video-container iframe {
          position: absolute !important;
          top: -70px !important;
          left: -1px !important;
          width: calc(100% + 2px) !important;
          height: calc(100% + 340px) !important;
          border: 0 !important;
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
