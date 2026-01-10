import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const instagramReels = [
  "C-C3abzBKYd",
  "C6YW6r6LI9-",
  "DTNVmDwgTon",
  "DRzgIPrjMNT",
  "DRUl9StDEsX",
  "DPngJf0Af1H",
];

const InstagramFeed = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

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
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-12 md:py-16 bg-background overflow-hidden">
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

      {/* Instagram Video Embeds */}
      <div className="relative">
        {/* Left Arrow */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5 text-black" />
        </button>

        {/* Right Arrow */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5 text-black" />
        </button>

        {/* Scrollable Container */}
        <div 
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth px-2"
        >
          {instagramReels.map((reelId) => (
            <div 
              key={reelId} 
              className="flex-shrink-0 w-[280px] md:w-[320px] aspect-[4/5] overflow-hidden relative instagram-video-container"
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
                  className="block w-full h-full bg-muted/30"
                />
              </blockquote>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .instagram-video-container {
          position: relative;
          overflow: hidden;
        }
        .instagram-video-container iframe {
          position: absolute !important;
          top: -64px !important;
          left: 0 !important;
          width: 100% !important;
          height: calc(100% + 180px) !important;
          border: 0 !important;
        }
        .instagram-video-container .instagram-media {
          min-width: 100% !important;
          width: 100% !important;
        }
      `}</style>
    </section>
  );
};

export default InstagramFeed;
