import { useEffect, useRef, useState } from "react";

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
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

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

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (scrollRef.current?.offsetLeft || 0));
    setScrollLeft(scrollRef.current?.scrollLeft || 0);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (scrollRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 1.5;
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  return (
    <section className="py-12 md:py-16 bg-black overflow-hidden">
      <div className="container mx-auto px-4 mb-8">
        <h2 className="text-center text-sm md:text-base tracking-[0.3em] text-white">
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
        <p className="text-center text-white/50 text-xs mt-2">Drag to see more →</p>
      </div>

      {/* Instagram Embeds - Draggable Scroll */}
      <div 
        ref={scrollRef}
        className={`flex gap-3 overflow-x-auto px-4 pb-4 scrollbar-hide select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {instagramReels.map((reelId) => (
          <div 
            key={reelId} 
            className="flex-shrink-0 w-[260px] md:w-[300px] instagram-embed-container rounded-lg overflow-hidden"
          >
            <blockquote
              className="instagram-media"
              data-instgrm-permalink={`https://www.instagram.com/reel/${reelId}/`}
              data-instgrm-version="14"
              style={{
                background: "#000",
                border: 0,
                borderRadius: "8px",
                margin: 0,
                maxWidth: "100%",
                minWidth: "260px",
                padding: 0,
                width: "100%",
              }}
            >
              <a
                href={`https://www.instagram.com/reel/${reelId}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="block aspect-[9/16] bg-muted/20 flex items-center justify-center"
              >
                <div className="text-white/60 text-sm">Loading...</div>
              </a>
            </blockquote>
          </div>
        ))}
      </div>

      <style>{`
        .instagram-embed-container {
          position: relative;
          overflow: hidden;
        }
        .instagram-embed-container iframe {
          border-radius: 8px !important;
          margin: 0 !important;
          min-height: 460px !important;
          max-height: 520px !important;
        }
        /* Hide white header/footer sections */
        .instagram-embed-container .instagram-media {
          background: #000 !important;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default InstagramFeed;
