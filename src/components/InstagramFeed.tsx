import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Instagram, Play } from "lucide-react";
import { useInstagramPosts } from "@/hooks/useInstagramPosts";

const InstagramFeed = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: posts, isLoading } = useInstagramPosts();
  const [showEmbeds, setShowEmbeds] = useState(false);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reelIds = posts?.map(p => p.reel_url) || [];

  useEffect(() => {
    if (reelIds.length === 0) return;

    setShowEmbeds(false);

    // Remove stale script if re-mounting
    const old = document.querySelector('script[src*="instagram.com/embed.js"]');
    if (old) old.remove();

    const processEmbeds = () => {
      try {
        if ((window as any).instgrm?.Embeds) {
          (window as any).instgrm.Embeds.process();
        }
      } catch (_) {}
      // Always reveal — whether embed loaded or not
      setShowEmbeds(true);
    };

    const script = document.createElement("script");
    script.src = "https://www.instagram.com/embed.js";
    script.async = true;
    script.onload = () => {
      // Give Instagram's script ~1s to inject iframes before revealing
      timerRef.current = setTimeout(processEmbeds, 1000);
    };
    script.onerror = () => {
      // Script failed to load — reveal cards anyway (shows fallback link)
      setShowEmbeds(true);
    };
    document.body.appendChild(script);
    scriptRef.current = script;

    // Hard fallback: reveal after 5s no matter what
    timerRef.current = setTimeout(() => setShowEmbeds(true), 5000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [reelIds.length]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const isMobile = window.innerWidth < 640;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -(isMobile ? 290 : 340) : (isMobile ? 290 : 340),
        behavior: "smooth",
      });
    }
  };

  if (isLoading) {
    return (
      <section className="py-10 sm:py-16 md:py-24 bg-secondary/30 overflow-hidden">
        <div className="container mx-auto px-3 sm:px-4 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
        </div>
      </section>
    );
  }

  if (reelIds.length === 0) return null;

  return (
    <section className="py-12 sm:py-20 md:py-28 bg-gradient-to-b from-background via-secondary/20 to-background overflow-hidden relative">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-tl from-orange-400/10 via-pink-500/10 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Header */}
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
        <div className="absolute left-0 top-0 bottom-0 w-4 sm:w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-4 sm:w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <div className="absolute inset-0 flex items-center justify-between pointer-events-none z-20 px-2 sm:px-4 lg:px-6">
          <button onClick={() => scroll("left")} className="pointer-events-auto w-10 sm:w-12 h-10 sm:h-12 bg-background/90 backdrop-blur-md hover:bg-primary hover:text-primary-foreground rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 border border-border/50 group" aria-label="Scroll left">
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <button onClick={() => scroll("right")} className="pointer-events-auto w-10 sm:w-12 h-10 sm:h-12 bg-background/90 backdrop-blur-md hover:bg-primary hover:text-primary-foreground rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 border border-border/50 group" aria-label="Scroll right">
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-3 sm:gap-5 lg:gap-6 overflow-x-auto scrollbar-hide scroll-smooth px-4 sm:px-16 lg:px-24 py-4"
        >
          {reelIds.map((reelId, index) => (
            <div
              key={reelId}
              className="ig-reel-wrap flex-shrink-0 w-[280px] sm:w-[300px] md:w-[320px] lg:w-[340px] rounded-xl sm:rounded-2xl border-2 border-border/30 hover:border-primary/50 shadow-2xl shadow-black/40 bg-black transition-all duration-500 hover:scale-[1.02]"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              {/* Loading skeleton shown until embed.js finishes */}
              {!showEmbeds && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-pink-600/20 via-purple-600/20 to-orange-500/10 z-10 rounded-xl sm:rounded-2xl">
                  <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur flex items-center justify-center mb-3 animate-pulse">
                    <Play className="w-7 h-7 text-white fill-white ml-1" />
                  </div>
                  <p className="text-white/70 text-xs font-medium">Loading reel...</p>
                </div>
              )}

              {/* embed.js blockquote — Instagram converts this to a real video iframe */}
              <blockquote
                className="instagram-media"
                data-instgrm-permalink={`https://www.instagram.com/reel/${reelId}/`}
                data-instgrm-version="14"
                style={{ background: "transparent", border: 0, margin: 0, padding: 0, width: "100%", maxWidth: "100%" }}
              >
                <a
                  href={`https://www.instagram.com/reel/${reelId}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-4 text-sm text-white/60 hover:text-white"
                >
                  <Instagram size={18} />
                  Watch on Instagram
                </a>
              </blockquote>

              {/* Black gradient overlay — hides Instagram's white header and footer chrome */}
              <div className="ig-top-mask" />
              <div className="ig-bottom-mask" />
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
          View All Reels
        </a>
      </div>

      <style>{`
        /* Container: clips the Instagram embed chrome (header/footer/actions) */
        .ig-reel-wrap {
          position: relative;
          overflow: hidden;
          aspect-ratio: 9 / 16;
        }

        /* When embed.js replaces blockquote → iframe, position it to fill the card */
        .ig-reel-wrap iframe {
          position: absolute !important;
          top: -65px !important;
          left: -1px !important;
          width: calc(100% + 2px) !important;
          height: calc(100% + 300px) !important;
          border: 0 !important;
        }

        @media (min-width: 640px) {
          .ig-reel-wrap iframe {
            top: -75px !important;
            height: calc(100% + 320px) !important;
          }
        }

        /* The blockquote itself should fill the container while waiting */
        .ig-reel-wrap .instagram-media {
          min-width: 100% !important;
          width: 100% !important;
          background: transparent !important;
        }

        /* Top mask — hides any Instagram header residue */
        .ig-top-mask {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 8px;
          background: #000;
          z-index: 9;
          pointer-events: none;
        }

        /* Bottom mask — completely hides white Instagram footer (View more, likes, comments) */
        /* Uses a short fade then solid black so the footer is always 100% covered */
        .ig-bottom-mask {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 250px;
          background: linear-gradient(to bottom,
            transparent 0%,
            rgba(0,0,0,0.6) 15%,
            rgba(0,0,0,0.95) 28%,
            #000 35%,
            #000 100%
          );
          z-index: 9;
          pointer-events: none;
        }

        @media (min-width: 640px) {
          .ig-bottom-mask {
            height: 280px;
          }
        }
      `}</style>
    </section>
  );
};

export default InstagramFeed;
