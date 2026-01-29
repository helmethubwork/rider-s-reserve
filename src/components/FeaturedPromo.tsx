import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useFeaturedPromos } from "@/hooks/useFeaturedPromos";
import { useSiteSettings } from "@/hooks/useSiteSettings";
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
  const { data: homepageSettings, isLoading: loadingSettings } = useSiteSettings('homepage');

  // Check if section is hidden via site settings
  const sectionVisible = homepageSettings?.find(s => s.setting_key === 'featured_promos_visible')?.setting_value !== 'false';

  // Map database promos
  const promos: PromoCard[] = (dbPromos || []).map(p => ({
    brand: p.brand,
    title: p.title,
    subtitle: p.subtitle,
    buttonText: p.button_text,
    buttonLink: p.button_link,
    image: p.image_url || '',
    accent: p.accent || undefined,
  })).filter(p => p.image);

  if (!loadingSettings && !sectionVisible) {
    return null;
  }

  if (isLoading || loadingSettings) {
    return (
      <section className="py-4 sm:py-6">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-[50vh] sm:h-[60vh] rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (promos.length === 0) {
    return null;
  }

  return (
    <section className="py-4 sm:py-6">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {promos.map((promo, idx) => (
            <div 
              key={idx} 
              className="relative h-[50vh] sm:h-[55vh] md:h-[60vh] overflow-hidden rounded-xl group"
            >
              {/* Background Image */}
              <img
                src={promo.image}
                alt={promo.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

              {/* Accent badge */}
              {promo.accent && (
                <div className="absolute top-4 right-4 z-10">
                  <span className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                    {promo.accent}
                  </span>
                </div>
              )}

              {/* Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-end text-center p-6 sm:p-8 pb-8 sm:pb-12">
                <p className="text-primary text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-2">
                  {promo.brand}
                </p>
                
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground mb-2 tracking-tight">
                  {promo.title}
                </h2>
                
                <p className="text-sm sm:text-base text-muted-foreground mb-5 max-w-sm">
                  {promo.subtitle}
                </p>
                
                <Link
                  to={promo.buttonLink}
                  className="group/btn inline-flex items-center gap-2 bg-foreground text-background font-bold px-6 py-3 text-xs sm:text-sm rounded-lg hover:bg-primary hover:text-primary-foreground transition-all duration-300 active:scale-95"
                >
                  {promo.buttonText}
                  <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedPromo;
