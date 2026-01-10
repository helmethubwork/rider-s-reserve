import { useEffect } from "react";

const instagramReels = [
  "C-C3abzBKYd",
  "C6YW6r6LI9-",
  "DTNVmDwgTon",
  "DRzgIPrjMNT",
  "DRUl9StDEsX",
  "DPngJf0Af1H",
];

const InstagramFeed = () => {
  useEffect(() => {
    // Load Instagram embed script
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
      </div>

      {/* Instagram Embeds - Horizontal Scroll */}
      <div className="flex gap-2 overflow-x-auto px-4 pb-4 scrollbar-hide">
        {instagramReels.map((reelId) => (
          <div 
            key={reelId} 
            className="flex-shrink-0 w-[280px] md:w-[320px] instagram-embed-container"
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
                minWidth: "280px",
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
        .instagram-embed-container iframe {
          border-radius: 8px !important;
          min-height: 480px !important;
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
