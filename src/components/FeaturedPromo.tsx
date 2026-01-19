import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { useFeaturedPromos } from "@/hooks/useFeaturedPromos";
import { Skeleton } from "@/components/ui/skeleton";

interface PromoCard {
  brand: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  image: string;
  accent?: string;
}

const FeaturedPromo = () => {
  const { data: dbPromos, isLoading } = useFeaturedPromos();

  // Map database promos, filter out any without valid images
  const promos: PromoCard[] = (dbPromos || []).map(p => ({
    brand: p.brand,
    title: p.title,
    subtitle: p.subtitle,
    buttonText: p.button_text,
    buttonLink: p.button_link,
    image: p.image_url || '',
    accent: p.accent || undefined,
  })).filter(p => p.image);

  if (isLoading) {
    return (
      <section className="py-2 sm:py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-[45vh] sm:h-[50vh] md:h-[65vh]" />
          ))}
        </div>
      </section>
    );
  }

  // Don't render section if no active promos with images
  if (promos.length === 0) {
    return null;
  }

  return (
    <section className="py-2 sm:py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
        {promos.map((promo, idx) => (
          <div key={idx} className="relative h-[45vh] sm:h-[50vh] md:h-[65vh] overflow-hidden group">
            {/* Background Image with zoom */}
            <img
              src={promo.image}
              alt={promo.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              loading="lazy"
            />
            
            {/* Overlay gradients */}
            <div className="absolute inset-0 bg-background/65" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Accent badge */}
            {promo.accent && (
              <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-10">
                <span className="inline-flex items-center gap-1.5 sm:gap-2 bg-primary text-primary-foreground text-[10px] sm:text-xs font-bold px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full uppercase tracking-wider shadow-lg">
                  <Sparkles size={12} className="sm:w-3.5 sm:h-3.5" />
                  {promo.accent}
                </span>
              </div>
            )}

            {/* Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 sm:p-8">
              {/* Brand */}
              <p className="text-[10px] sm:text-xs md:text-sm tracking-[0.3em] sm:tracking-[0.4em] text-primary font-bold mb-2 sm:mb-3 uppercase">
                {promo.brand}
              </p>
              
              {/* Title */}
              <h2 className="text-xl sm:text-3xl md:text-5xl lg:text-6xl font-black text-foreground mb-2 sm:mb-4 tracking-tight leading-tight">
                {promo.title}
              </h2>
              
              {/* Subtitle */}
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-4 sm:mb-8 max-w-md">
                {promo.subtitle}
              </p>
              
              {/* Button */}
              <Link
                to={promo.buttonLink}
                className="group/btn inline-flex items-center gap-2 sm:gap-3 border-2 border-foreground/80 text-foreground font-bold px-5 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm tracking-[0.1em] sm:tracking-[0.15em] rounded-lg hover:bg-foreground hover:text-background transition-all duration-500 backdrop-blur-sm active:scale-95"
              >
                {promo.buttonText}
                <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px] group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Decorative corner elements - hidden on mobile */}
            <div className="absolute bottom-0 left-0 w-24 sm:w-32 h-24 sm:h-32 hidden sm:block">
              <div className="absolute bottom-4 left-4 w-full h-full border-l-2 border-b-2 border-primary/30 rounded-bl-2xl" />
            </div>
            <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 hidden sm:block">
              <div className="absolute top-4 right-4 w-full h-full border-r-2 border-t-2 border-primary/30 rounded-tr-2xl" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedPromo;
