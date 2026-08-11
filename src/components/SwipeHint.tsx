/**
 * SwipeHint
 *
 * Small "← SWIPE →" cue shown under horizontally scrollable rows.
 * Only renders on screens where the row actually overflows.
 */

interface SwipeHintProps {
  /** Hide above this breakpoint. Default "lg" (desktop rows usually fit). */
  hideAbove?: "sm" | "md" | "lg";
  className?: string;
}

const hideClass = {
  sm: "sm:hidden",
  md: "md:hidden",
  lg: "lg:hidden",
} as const;

const SwipeHint = ({ hideAbove = "lg", className = "" }: SwipeHintProps) => (
  <div
    className={`flex ${hideClass[hideAbove]} items-center justify-center gap-2 mt-6 ${className}`}
    aria-hidden="true"
  >
    <span className="text-muted-foreground/50 text-xs animate-pulse">←</span>
    <span className="text-muted-foreground/50 text-[10px] font-bold uppercase tracking-[0.25em]">
      Swipe
    </span>
    <span className="text-muted-foreground/50 text-xs animate-pulse">→</span>
  </div>
);

export default SwipeHint;
