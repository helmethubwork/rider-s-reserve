import { Leaf, Package, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: Leaf,
    title: "Genuine Products",
    description: "We are the sole distributors in All Over India.",
  },
  {
    icon: Package,
    title: "Express Delivery",
    description: "Get your order delivered within 3-4 days.",
  },
  {
    icon: ShieldCheck,
    title: "Warranty",
    description: "All our products carry 6 months to 2-years warranty.",
  },
];

const WhyHelmetHub = () => {
  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-card rounded-lg p-10 text-center border border-border hover:border-primary/50 transition-all duration-300"
            >
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <feature.icon className="w-10 h-10 text-primary stroke-[1]" />
              </div>
              
              {/* Title */}
              <h3 className="text-base font-medium text-foreground mb-3">
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
