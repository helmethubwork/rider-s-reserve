import { Truck, ShieldCheck, Award, Headphones } from "lucide-react";
import SwipeHint from "@/components/SwipeHint";

const features = [
  {
    icon: Award,
    title: "Genuine Products",
    description: "100% authentic products from authorized distributors across India.",
  },
  {
    icon: Truck,
    title: "Express Delivery",
    description: "Fast & secure delivery within 3–4 business days nationwide.",
  },
  {
    icon: ShieldCheck,
    title: "Extended Warranty",
    description: "6 months to 2-year warranty coverage on all products.",
  },
  {
    icon: Headphones,
    title: "Expert Support",
    description: "Riding gear specialists on call & WhatsApp to help you choose.",
  },
];

const WhyHelmetHub = () => {
  return (
    <section className="py-10 sm:py-16 md:py-24 lg:py-28 bg-gradient-to-b from-background to-secondary/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-5 sm:top-10 md:top-20 left-3 sm:left-5 md:left-10 w-16 sm:w-20 md:w-32 h-16 sm:h-20 md:h-32 bg-primary/5 rounded-full blur-2xl" />
        <div className="absolute bottom-5 sm:bottom-10 md:bottom-20 right-3 sm:right-5 md:right-10 w-24 sm:w-32 md:w-48 h-24 sm:h-32 md:h-48 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-3 sm:px-4 relative z-10">
        {/* Section header */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <span className="text-primary text-[10px] sm:text-xs md:text-sm font-bold tracking-[0.15em] sm:tracking-[0.2em] md:tracking-[0.3em] uppercase mb-2 sm:mb-3 md:mb-4 block">
            Why Choose Us
          </span>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black text-foreground tracking-tight">
            The Helmet Hub Difference
          </h2>
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-3 sm:mt-4 md:mt-6">
            <div className="w-8 sm:w-10 md:w-16 h-0.5 sm:h-1 bg-primary rounded-full" />
            <div className="w-1.5 sm:w-2 md:w-3 h-1.5 sm:h-2 md:h-3 bg-primary rounded-full" />
            <div className="w-8 sm:w-10 md:w-16 h-0.5 sm:h-1 bg-primary rounded-full" />
          </div>
        </div>

        {/* Features Grid */}
        {/* Swipe carousel on mobile, 4-up grid from large screens */}
        <div className="flex lg:grid lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 max-w-6xl mx-auto items-stretch overflow-x-auto lg:overflow-visible scrollbar-hide snap-x snap-mandatory pb-2 -mx-3 px-3 sm:-mx-4 sm:px-4 lg:mx-0 lg:px-0">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group flex flex-col h-auto lg:h-full w-[65vw] sm:w-[42vw] md:w-[32vw] lg:w-auto flex-shrink-0 lg:flex-shrink snap-start p-4 sm:p-5 md:p-6 bg-card/40 rounded-xl border border-border/40 hover:border-primary/40 hover:bg-card/70 transition-all duration-300"
            >
              {/* Icon */}
              <div className="w-11 sm:w-12 md:w-14 h-11 sm:h-12 md:h-14 mx-auto mb-3 sm:mb-4 bg-primary/10 rounded-lg flex items-center justify-center transition-colors duration-300 group-hover:bg-primary/20">
                <feature.icon
                  className="w-5 sm:w-6 md:w-7 h-5 sm:h-6 md:h-7 text-primary"
                  strokeWidth={1.75}
                />
              </div>

              {/* Title */}
              <h3 className="text-[13px] sm:text-[15px] md:text-base font-bold text-foreground mb-1.5 text-center tracking-[-0.01em] group-hover:text-primary transition-colors duration-300">
                {feature.title}
              </h3>

              {/* Description — grows to fill so all cards line up */}
              <p className="text-muted-foreground text-[11px] sm:text-xs md:text-[13px] leading-relaxed text-center flex-1">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <SwipeHint hideAbove="lg" />
      </div>
    </section>
  );
};

export default WhyHelmetHub;
