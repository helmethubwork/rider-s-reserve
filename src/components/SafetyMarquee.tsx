/**
 * SafetyMarquee
 *
 * A continuously scrolling band of original road-safety lines written for
 * Helmet Hub. Pure CSS animation (no JS timers) so it stays smooth and
 * costs nothing in performance.
 */

const SAFETY_QUOTES = [
  "Your helmet is the only thing between you and the road.",
  "Ride like you're invisible. Gear up like it's certain.",
  "Every great ride ends the same way — you, home, safe.",
  "Speed is a thrill. Protection is a promise.",
  "The road forgives nothing. Your helmet forgives a lot.",
  "One strap. Two seconds. Countless tomorrows.",
  "Helmets aren't heavy. Regret is.",
  "Protect the head that carries all your plans.",
  "No destination is worth not arriving at.",
  "Gear on. Guard up. Ride free.",
];

const SafetyMarquee = () => {
  return (
    <section
      className="relative py-4 sm:py-6 bg-gradient-to-r from-primary via-accent to-primary overflow-hidden select-none"
      aria-label="Road safety messages"
    >
      {/* Soft edge fades so text slides in and out rather than snapping */}
      <div className="absolute inset-y-0 left-0 w-12 sm:w-28 bg-gradient-to-r from-primary to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-12 sm:w-28 bg-gradient-to-l from-primary to-transparent z-10 pointer-events-none" />

      <div className="marquee-track flex items-center gap-6 sm:gap-10 whitespace-nowrap">
        {/* Rendered twice so the loop is seamless */}
        {[0, 1].map((pass) => (
          <div key={pass} className="flex items-center gap-6 sm:gap-10 shrink-0" aria-hidden={pass === 1}>
            {SAFETY_QUOTES.map((quote, i) => (
              <span key={`${pass}-${i}`} className="flex items-center gap-6 sm:gap-10 shrink-0">
                <span className="text-primary-foreground font-extrabold text-sm sm:text-lg md:text-xl tracking-[-0.02em]">
                  {quote}
                </span>
                {/* Diamond separator */}
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rotate-45 bg-primary-foreground/50 shrink-0" />
              </span>
            ))}
          </div>
        ))}
      </div>

      <style>{`
        .marquee-track {
          width: max-content;
          animation: marquee-scroll 45s linear infinite;
        }

        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        /* Slightly faster on mobile so lines don't feel stalled */
        @media (max-width: 640px) {
          .marquee-track { animation-duration: 30s; }
        }

        /* Respect users who prefer no motion */
        @media (prefers-reduced-motion: reduce) {
          .marquee-track { animation: none; }
        }
      `}</style>
    </section>
  );
};

export default SafetyMarquee;
