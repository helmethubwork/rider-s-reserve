import { Leaf, Package, ShieldCheck, Headphones, Truck, Award } from "lucide-react";

const features = [
  {
    icon: Award,
    title: "Genuine Products",
    description: "100% authentic products from authorized distributors across India.",
  },
  {
    icon: Truck,
    title: "Express Delivery",
    description: "Fast & secure delivery within 3-4 business days nationwide.",
  },
  {
    icon: ShieldCheck,
    title: "Extended Warranty",
    description: "6 months to 2-year warranty coverage on all products.",
  },
];

const WhyHelmetHub = () => {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-background to-secondary/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="text-primary text-sm font-bold tracking-[0.3em] uppercase mb-4 block">
            Why Choose Us
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground tracking-tight">
            The Helmet Hub Difference
          </h2>
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="w-16 h-1 bg-primary rounded-full" />
            <div className="w-3 h-3 bg-primary rounded-full" />
            <div className="w-16 h-1 bg-primary rounded-full" />
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="feature-card group"
            >
              {/* Icon container */}
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:bg-primary group-hover:shadow-lg group-hover:scale-110">
                  <feature.icon className="w-10 h-10 text-primary group-hover:text-primary-foreground transition-colors duration-500" strokeWidth={1.5} />
                </div>
                {/* Glow effect */}
                <div className="absolute inset-0 w-20 h-20 mx-auto bg-primary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              
              {/* Title */}
              <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                {feature.title}
              </h3>
              
              {/* Description */}
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                {feature.description}
              </p>

              {/* Bottom accent line */}
              <div className="w-0 h-1 bg-primary rounded-full mx-auto mt-6 group-hover:w-16 transition-all duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyHelmetHub;
