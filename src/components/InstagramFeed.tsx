import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Instagram, Play } from "lucide-react";
import { useInstagramPosts } from "@/hooks/useInstagramPosts";

const InstagramFeed = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: posts, isLoading } = useInstagramPosts();
  const [embedsLoaded, setEmbedsLoaded] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Extract reel IDs from posts
  const reelIds = posts?.map(p => p.reel_url) || [];

  // Load Instagram embed script
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
      const scrollAmount = 200;
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

  const activeReelId = reelIds[activeIndex];

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

      {/* Big Video Screen Layout */}
      <div className="container mx-auto px-3 sm:px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Main Big Video */}
          <div className="lg:col-span-2">
            <div 
              className="aspect-[9/16] sm:aspect-video lg:aspect-[16/10] overflow-hidden relative instagram-video-main rounded-2xl border-2 border-primary/30 shadow-2xl bg-card"
            >
              {/* Loading placeholder */}
              {!embedsLoaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-orange-400/20 z-10">
                  <div className="w-20 h-20 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center mb-4 shadow-lg">
                    <Play className="w-10 h-10 text-foreground ml-1" />
                  </div>
                  <p className="text-base text-muted-foreground">Loading featured video...</p>
                </div>
              )}
              
              <blockquote
                key={activeReelId}
                className="instagram-media"
                data-instgrm-permalink={`https://www.instagram.com/reel/${activeReelId}/`}
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
                  href={`https://www.instagram.com/reel/${activeReelId}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full h-full"
                />
              </blockquote>

              {/* Video overlay info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 sm:p-6 pointer-events-none">
                <div className="flex items-center gap-3">
                  <Instagram className="w-5 h-5 text-white" />
                  <span className="text-white font-bold text-sm sm:text-base">Featured Reel</span>
                </div>
              </div>
            </div>
          </div>

          {/* Thumbnail Strip */}
          <div className="lg:col-span-1 relative">
            {/* Mobile: Horizontal scroll */}
            <div className="lg:hidden relative">
              <button
                onClick={() => scroll("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-background/90 backdrop-blur-sm hover:bg-primary rounded-full flex items-center justify-center shadow-xl transition-all duration-300 border border-border"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4 text-foreground" />
              </button>
              
              <button
                onClick={() => scroll("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-background/90 backdrop-blur-sm hover:bg-primary rounded-full flex items-center justify-center shadow-xl transition-all duration-300 border border-border"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4 text-foreground" />
              </button>
              
              <div 
                ref={scrollRef}
                className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth px-8"
              >
                {reelIds.map((reelId, index) => (
                  <button
                    key={reelId}
                    onClick={() => setActiveIndex(index)}
                    className={`flex-shrink-0 w-24 h-40 rounded-lg overflow-hidden relative transition-all duration-300 ${
                      index === activeIndex 
                        ? 'ring-2 ring-primary scale-105 shadow-lg' 
                        : 'opacity-70 hover:opacity-100 hover:scale-102'
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/30 via-purple-500/30 to-orange-400/30 flex items-center justify-center">
                      <Play className="w-6 h-6 text-white drop-shadow-lg" />
                    </div>
                    <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-2 py-0.5 rounded font-bold">
                      {index + 1}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop: Vertical grid */}
            <div className="hidden lg:grid grid-cols-2 gap-3 h-full">
              {reelIds.slice(0, 4).map((reelId, index) => (
                <button
                  key={reelId}
                  onClick={() => setActiveIndex(index)}
                  className={`aspect-[9/16] rounded-xl overflow-hidden relative transition-all duration-300 ${
                    index === activeIndex 
                      ? 'ring-2 ring-primary scale-[1.02] shadow-xl' 
                      : 'opacity-60 hover:opacity-100 hover:scale-[1.01] shadow-lg'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/40 via-purple-500/40 to-orange-400/40 flex items-center justify-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      index === activeIndex ? 'bg-primary' : 'bg-background/80'
                    }`}>
                      <Play className={`w-6 h-6 ml-0.5 ${index === activeIndex ? 'text-primary-foreground' : 'text-foreground'}`} />
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full font-bold">
                    Reel {index + 1}
                  </div>
                  {index === activeIndex && (
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-bold">
                      Now Playing
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .instagram-video-main {
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--secondary)) 100%);
        }
        .instagram-video-main iframe {
          position: absolute !important;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) !important;
          width: 100% !important;
          height: 100% !important;
          min-width: 100% !important;
          min-height: 100% !important;
          border: 0 !important;
          object-fit: cover !important;
        }
        .instagram-video-main .instagram-media {
          min-width: 100% !important;
          width: 100% !important;
          height: 100% !important;
          background: transparent !important;
        }
        .instagram-video-main .instagram-media-rendered {
          background: transparent !important;
        }
        @media (min-width: 1024px) {
          .instagram-video-main {
            min-height: 500px;
          }
        }
      `}</style>
    </section>
  );
};

export default InstagramFeed;
