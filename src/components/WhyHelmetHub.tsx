import { Truck, ShieldCheck, Award, Headphones } from "lucide-react";

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
    description: "Our riding gear specialists are available on call & WhatsApp to help you choose right.",
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
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="feature-card group p-4 sm:p-6 md:p-8 bg-card/50 rounded-xl sm:rounded-2xl border border-border/50 hover:border-primary/30 transition-all duration-300"
            >
              {/* Icon container */}
              <div className="relative mb-3 sm:mb-4 md:mb-6">
                <div className="w-12 sm:w-14 md:w-20 h-12 sm:h-14 md:h-20 mx-auto bg-primary/10 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:bg-primary group-hover:shadow-lg group-hover:scale-110">
                  <feature.icon className="w-6 sm:w-7 md:w-10 h-6 sm:h-7 md:h-10 text-primary group-hover:text-primary-foreground transition-colors duration-500" strokeWidth={1.5} />
                </div>
                {/* Glow effect */}
                <div className="absolute inset-0 w-12 sm:w-14 md:w-20 h-12 sm:h-14 md:h-20 mx-auto bg-primary/20 rounded-lg sm:rounded-xl md:rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              
              {/* Title */}
              <h3 className="text-sm sm:text-base md:text-xl font-bold text-foreground mb-1.5 sm:mb-2 md:mb-3 text-center group-hover:text-primary transition-colors duration-300">
                {feature.title}
              </h3>
              
              {/* Description */}
              <p className="text-muted-foreground text-[11px] sm:text-xs md:text-sm lg:text-base leading-relaxed text-center">
                {feature.description}
              </p>

              {/* Bottom accent line */}
              <div className="w-0 h-0.5 sm:h-1 bg-primary rounded-full mx-auto mt-3 sm:mt-4 md:mt-6 group-hover:w-10 sm:group-hover:w-12 md:group-hover:w-16 transition-all duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyHelmetHub;
