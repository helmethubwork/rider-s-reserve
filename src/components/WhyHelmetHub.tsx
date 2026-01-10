import { Truck, ShieldCheck, ThumbsUp } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "FREE SHIPPING",
    description: "We offer free shipping across India on all orders.",
  },
  {
    icon: ShieldCheck,
    title: "GENUINE PRODUCTS",
    description: "We are authorized distributors for the brands we represent. So, all the products sold by us are genuine.",
  },
  {
    icon: ThumbsUp,
    title: "WARRANTY",
    description: "All our products carry 6 months to 2-years warranty.",
  },
];

const WhyHelmetHub = () => {
  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <h2 className="text-center text-2xl md:text-3xl font-medium tracking-wide text-foreground mb-12 md:mb-16">
          WHY HELMET HUB?
        </h2>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              {/* Icon */}
              <div className="flex justify-center mb-5">
                <feature.icon className="w-12 h-12 text-primary stroke-[1.5]" />
              </div>
              
              {/* Title */}
              <h3 className="text-sm md:text-base font-semibold tracking-[0.15em] text-foreground mb-3">
                {feature.title}
              </h3>
              
              {/* Description */}
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyHelmetHub;
