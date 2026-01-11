import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import helmet2 from "@/assets/products/helmet-2.jpg";
import helmet3 from "@/assets/products/helmet-3.jpg";

interface PromoCard {
  brand: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  image: string;
  accent?: string;
}

const promos: PromoCard[] = [
  {
    brand: "KORDA",
    title: "TOURMASTER WITH D3O",
    subtitle: "Just Launched",
    buttonText: "SHOP NOW",
    buttonLink: "/category/riding-gears?type=boots",
    image: helmet2,
    accent: "New Arrival",
  },
  {
    brand: "MT TARGO",
    title: "SUMMER SPECIAL OFFER",
    subtitle: "Now available at just Rs. 3,999!",
    buttonText: "SHOP TARGO",
    buttonLink: "/brands/mt",
    image: helmet3,
    accent: "Limited Time",
  },
];

const FeaturedPromo = () => {
  return (
    <section className="py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
        {promos.map((promo, idx) => (
          <div key={idx} className="relative h-[50vh] md:h-[65vh] overflow-hidden group">
            {/* Background Image with zoom */}
            <img
              src={promo.image}
              alt={promo.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            
            {/* Overlay gradients */}
            <div className="absolute inset-0 bg-background/65" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Accent badge */}
            {promo.accent && (
              <div className="absolute top-6 right-6 z-10">
                <span className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider shadow-lg">
                  <Sparkles size={14} />
                  {promo.accent}
                </span>
              </div>
            )}

            {/* Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
              {/* Brand */}
              <p className="text-xs md:text-sm tracking-[0.4em] text-primary font-bold mb-3 uppercase">
                {promo.brand}
              </p>
              
              {/* Title */}
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-foreground mb-4 tracking-tight leading-tight">
                {promo.title}
              </h2>
              
              {/* Subtitle */}
              <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-md">
                {promo.subtitle}
              </p>
              
              {/* Button */}
              <Link
                to={promo.buttonLink}
                className="group/btn inline-flex items-center gap-3 border-2 border-foreground/80 text-foreground font-bold px-8 py-4 text-sm tracking-[0.15em] rounded-lg hover:bg-foreground hover:text-background transition-all duration-500 backdrop-blur-sm"
              >
                {promo.buttonText}
                <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Decorative corner elements */}
            <div className="absolute bottom-0 left-0 w-32 h-32">
              <div className="absolute bottom-4 left-4 w-full h-full border-l-2 border-b-2 border-primary/30 rounded-bl-2xl" />
            </div>
            <div className="absolute top-0 right-0 w-32 h-32">
              <div className="absolute top-4 right-4 w-full h-full border-r-2 border-t-2 border-primary/30 rounded-tr-2xl" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedPromo;
