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
      const scrollAmount = 340;
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
              className="flex-shrink-0 w-[240px] sm:w-[300px] md:w-[340px] aspect-[9/16] overflow-hidden relative instagram-video-container rounded-lg sm:rounded-xl border border-border/50 shadow-lg bg-card"
            >
              {/* Loading placeholder */}
              {!embedsLoaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-orange-400/20 z-10">
                  <div className="w-16 h-16 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center mb-3 shadow-lg">
                    <Play className="w-8 h-8 text-foreground ml-1" />
                  </div>
                  <p className="text-sm text-muted-foreground">Loading reel...</p>
                </div>
              )}
              
              <blockquote
                className="instagram-media"
                data-instgrm-permalink={`https://www.instagram.com/reel/${reelId}/`}
                data-instgrm-version="14"
                data-instgrm-captioned
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

      <style>{`
        .instagram-video-container {
          position: relative;
          overflow: hidden;
          background: #000;
          clip-path: inset(0 0 0 0);
        }
        .instagram-video-container iframe {
          position: absolute !important;
          top: -60px !important;
          left: -1px !important;
          width: calc(100% + 2px) !important;
          height: calc(100% + 200px) !important;
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
