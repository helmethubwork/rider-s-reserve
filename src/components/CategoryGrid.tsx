import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { useCategories, SupabaseCategory } from "@/hooks/useCategories";
import { Skeleton } from "@/components/ui/skeleton";

const LoadingSkeleton = () => (
  <section className="py-8 sm:py-16 md:py-24 bg-background">
    <div className="container mx-auto px-4">
      <div className="text-center mb-6 sm:mb-14">
        <Skeleton className="h-4 w-32 mx-auto mb-4" />
        <Skeleton className="h-10 w-64 mx-auto" />
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <Skeleton className="aspect-[3/4] rounded-2xl" />
        <Skeleton className="aspect-[3/4] rounded-2xl" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="aspect-square rounded-2xl" />
        ))}
      </div>
    </div>
  </section>
);

const CategoryCard = ({ category, isLarge = false, index = 0 }: { category: SupabaseCategory; isLarge?: boolean; index?: number }) => {
  // Link by slug, not the admin's free-text href field. Products are fetched by
  // slug, so a mismatched href sends customers to an empty page.
  const href = `/category/${category.slug}`;
  
  // Gradient colors for visual variety - black + yellow theme
  const gradientColors = [
    "from-yellow-500/20 via-amber-500/10",
    "from-amber-500/20 via-orange-500/10", 
    "from-yellow-600/20 via-yellow-400/10",
    "from-orange-500/20 via-amber-500/10",
    "from-yellow-400/20 via-yellow-600/10",
    "from-amber-600/20 via-orange-400/10",
  ];
  
  const accentGradient = gradientColors[index % gradientColors.length];
  
  return (
    <Link
      to={href}
      className={`relative block overflow-hidden group rounded-xl sm:rounded-2xl active:scale-[0.98] transition-all duration-300 shadow-md hover:shadow-2xl ${
        isLarge 
          ? "aspect-[4/5] sm:aspect-[3/4] md:aspect-[4/5] min-h-[200px] sm:min-h-[280px] md:min-h-[400px] lg:min-h-[520px]" 
          : "aspect-[4/5] sm:aspect-square md:aspect-[4/5] min-h-[180px] sm:min-h-[200px]"
      }`}
    >
      {/* Image with zoom effect */}
      <img
        src={category.image_url || '/placeholder.svg'}
        alt={category.name}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 absolute inset-0"
        loading="lazy"
      />
      
      {/* Multi-layer gradient overlay - enhanced for mobile */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/10" />
      <div className={`absolute inset-0 bg-gradient-to-br ${accentGradient} to-transparent opacity-50 group-hover:opacity-70 transition-opacity duration-500`} />
      
      {/* Animated shimmer effect - only on larger screens */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 hidden sm:block">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>
      
      {/* Glowing border on hover */}
      <div className="absolute inset-0 rounded-xl sm:rounded-2xl ring-1 sm:ring-2 ring-inset ring-white/10 group-hover:ring-primary/50 transition-all duration-500" />
      
      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-start justify-end p-3 sm:p-5 md:p-6 lg:p-8">
        {/* Shop Now tag - more visible on mobile */}
        <span className="inline-flex items-center gap-1 sm:gap-1.5 bg-primary text-primary-foreground text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-wider px-2 sm:px-3 py-1 sm:py-1.5 rounded-full mb-2 sm:mb-3 shadow-lg">
          <Sparkles size={10} className="sm:w-3 sm:h-3 animate-pulse" />
          Shop Now
        </span>
        
        {/* Category name - optimized for all screens */}
        <h3 className={`font-black text-white uppercase tracking-wide mb-0.5 sm:mb-1 drop-shadow-lg transition-transform duration-300 group-hover:translate-x-1 leading-tight ${
          isLarge 
            ? "text-lg sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl" 
            : "text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl"
        }`}>
          {category.name}
        </h3>
        
        {/* Subtitle - always visible */}
        {category.subtitle && (
          <p className="text-white/80 text-[10px] sm:text-xs md:text-sm max-w-[95%] mb-2 sm:mb-3 line-clamp-2 drop-shadow">
            {category.subtitle}
          </p>
        )}
        
        {/* CTA Button - compact on mobile */}
        <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
          <div className="flex items-center gap-1.5 sm:gap-2 bg-white/20 backdrop-blur-sm px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wide text-white group-hover:text-primary-foreground">
              Explore
            </span>
            <ArrowRight size={12} className="sm:w-3.5 sm:h-3.5 text-white group-hover:text-primary-foreground transform group-hover:translate-x-0.5 transition-all duration-300" />
          </div>
        </div>
      </div>

      {/* Decorative corner accent - hidden on mobile */}
      <div className="absolute top-2 sm:top-3 right-2 sm:right-3 hidden sm:block">
        <div className="w-7 sm:w-8 md:w-10 h-7 sm:h-8 md:h-10 rounded-full bg-primary/30 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:rotate-90">
          <ArrowRight size={14} className="sm:w-4 sm:h-4 text-white -rotate-45" />
        </div>
      </div>
    </Link>
  );
};

const CategoryGrid = () => {
  const { data: categories = [], isLoading } = useCategories();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (categories.length === 0) {
    return null;
  }

  // Separate large and regular categories based on is_large field
  const largeCategories = categories.filter(c => c.is_large).slice(0, 2);
  const regularCategories = categories.filter(c => !c.is_large);

  return (
    <section className="py-6 sm:py-12 md:py-20 lg:py-24 bg-background">
      <div className="container mx-auto px-3 sm:px-4">
        {/* Section header - mobile optimized */}
        <div className="text-center mb-5 sm:mb-10 md:mb-14">
          <span className="inline-flex items-center gap-1.5 sm:gap-2 text-primary text-[10px] sm:text-xs md:text-sm font-bold tracking-widest uppercase mb-2 sm:mb-3 bg-primary/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full">
            <Sparkles size={12} className="sm:w-3.5 sm:h-3.5" />
            Browse Categories
          </span>
          <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-black text-foreground uppercase tracking-tight">
            Shop By Category
          </h2>
          <div className="flex items-center justify-center gap-2 mt-3 sm:mt-4">
            <div className="w-8 sm:w-12 h-0.5 sm:h-1 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full" />
          </div>
        </div>
        
        {/* Mobile-first grid layout */}
        <div className="space-y-2 sm:space-y-4 md:space-y-5">
          {/* First row - large banners (2 columns on all screens) */}
          {largeCategories.length > 0 && (
            <div className="grid grid-cols-2 gap-2 sm:gap-4 md:gap-5">
              {largeCategories.map((category, idx) => (
                <CategoryCard key={category.id} category={category} isLarge={true} index={idx} />
              ))}
            </div>
          )}
          
          {/* Regular categories - 2 cols mobile, 3 cols tablet, 4 cols desktop */}
          {regularCategories.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-5">
              {regularCategories.map((category, idx) => (
                <CategoryCard key={category.id} category={category} index={idx + 2} />
              ))}
            </div>
          )}
        </div>
        
        {/* Mobile scroll hint */}
        <div className="mt-4 sm:mt-6 text-center sm:hidden">
          <p className="text-muted-foreground text-[10px]">Tap any category to explore</p>
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
