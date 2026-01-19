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

const SECTION_VISIBILITY_KEY = 'featured_promos_visible';

const FeaturedPromo = () => {
  const { data: dbPromos, isLoading } = useFeaturedPromos();

  // Check if section is hidden via admin toggle
  const sectionVisible = localStorage.getItem(SECTION_VISIBILITY_KEY) !== 'false';

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

  // Don't render if section is hidden via admin toggle
  if (!sectionVisible) {
    return null;
  }

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
    <section className="py-1 sm:py-2 md:py-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
        {promos.map((promo, idx) => (
          <div key={idx} className="relative h-[50vh] sm:h-[45vh] md:h-[55vh] lg:h-[65vh] overflow-hidden group">
            {/* Background Image with zoom */}
            <img
              src={promo.image}
              alt={promo.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              loading="lazy"
            />
            
            {/* Overlay gradients */}
            <div className="absolute inset-0 bg-background/60 sm:bg-background/65" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Accent badge */}
            {promo.accent && (
              <div className="absolute top-3 sm:top-4 md:top-6 right-3 sm:right-4 md:right-6 z-10">
                <span className="inline-flex items-center gap-1 sm:gap-1.5 md:gap-2 bg-primary text-primary-foreground text-[9px] sm:text-[10px] md:text-xs font-bold px-2 sm:px-2.5 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full uppercase tracking-wider shadow-lg">
                  <Sparkles size={10} className="sm:w-3 sm:h-3" />
                  {promo.accent}
                </span>
              </div>
            )}

            {/* Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 sm:p-6 md:p-8">
              {/* Brand */}
              <p className="text-[9px] sm:text-[10px] md:text-xs lg:text-sm tracking-[0.25em] sm:tracking-[0.3em] md:tracking-[0.4em] text-primary font-bold mb-1.5 sm:mb-2 md:mb-3 uppercase">
                {promo.brand}
              </p>
              
              {/* Title */}
              <h2 className="text-lg sm:text-xl md:text-3xl lg:text-5xl xl:text-6xl font-black text-foreground mb-1.5 sm:mb-2 md:mb-4 tracking-tight leading-tight max-w-[95%] sm:max-w-none">
                {promo.title}
              </h2>
              
              {/* Subtitle */}
              <p className="text-xs sm:text-sm md:text-base lg:text-lg text-muted-foreground mb-3 sm:mb-4 md:mb-6 lg:mb-8 max-w-[90%] sm:max-w-md">
                {promo.subtitle}
              </p>
              
              {/* Button */}
              <Link
                to={promo.buttonLink}
                className="group/btn inline-flex items-center gap-1.5 sm:gap-2 md:gap-3 border-2 border-foreground/80 text-foreground font-bold px-4 sm:px-5 md:px-8 py-2.5 sm:py-3 md:py-4 text-[10px] sm:text-xs md:text-sm tracking-[0.1em] sm:tracking-[0.15em] rounded-lg hover:bg-foreground hover:text-background transition-all duration-500 backdrop-blur-sm active:scale-95"
              >
                {promo.buttonText}
                <ArrowRight size={14} className="sm:w-4 sm:h-4 md:w-[18px] md:h-[18px] group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Decorative corner elements - hidden on mobile */}
            <div className="absolute bottom-0 left-0 w-20 sm:w-24 md:w-32 h-20 sm:h-24 md:h-32 hidden md:block">
              <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 w-full h-full border-l-2 border-b-2 border-primary/30 rounded-bl-2xl" />
            </div>
            <div className="absolute top-0 right-0 w-20 sm:w-24 md:w-32 h-20 sm:h-24 md:h-32 hidden md:block">
              <div className="absolute top-3 sm:top-4 right-3 sm:right-4 w-full h-full border-r-2 border-t-2 border-primary/30 rounded-tr-2xl" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedPromo;
