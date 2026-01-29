import { ShieldCheck, Truck, RotateCcw, Lock } from "lucide-react";

const badges = [
  {
    icon: ShieldCheck,
    title: "100% Authentic",
    subtitle: "Genuine Products",
  },
  {
    icon: Truck,
    title: "Free Shipping",
    subtitle: "Orders Above ₹999",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    subtitle: "7-Day Policy",
  },
  {
    icon: Lock,
    title: "Secure Payments",
    subtitle: "100% Protected",
  },
];

const TrustBadges = () => {
  return (
    <section className="bg-secondary/50 border-y border-border/50">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border/50">
          {badges.map((badge, index) => (
            <div
              key={index}
              className="flex items-center gap-3 py-4 sm:py-5 px-3 sm:px-6 justify-center"
            >
              <div className="flex-shrink-0">
                <badge.icon 
                  className="w-5 h-5 sm:w-6 sm:h-6 text-primary" 
                  strokeWidth={1.5} 
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                  {badge.title}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                  {badge.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;
