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
  const href = category.href || `/category/${category.slug}`;
  
  // Gradient colors for visual variety
  const gradientColors = [
    "from-yellow-500/20 via-orange-500/10",
    "from-blue-500/20 via-cyan-500/10", 
    "from-purple-500/20 via-pink-500/10",
    "from-green-500/20 via-emerald-500/10",
    "from-red-500/20 via-rose-500/10",
    "from-indigo-500/20 via-violet-500/10",
  ];
  
  const accentGradient = gradientColors[index % gradientColors.length];
  
  return (
    <Link
      to={href}
      className={`relative block overflow-hidden group rounded-2xl active:scale-[0.97] transition-all duration-300 shadow-lg hover:shadow-2xl ${
        isLarge ? "aspect-[3/4] sm:aspect-[4/5] md:min-h-[520px]" : "aspect-square sm:aspect-[4/5]"
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
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      <div className={`absolute inset-0 bg-gradient-to-br ${accentGradient} to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500`} />
      
      {/* Animated shimmer effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>
      
      {/* Glowing border on hover */}
      <div className="absolute inset-0 rounded-2xl ring-2 ring-inset ring-white/10 group-hover:ring-primary/50 transition-all duration-500" />
      
      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-start justify-end p-4 sm:p-6 md:p-8">
        {/* Shop Now tag - more visible on mobile */}
        <span className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full mb-3 shadow-lg">
          <Sparkles size={12} className="animate-pulse" />
          Shop Now
        </span>
        
        {/* Category name - larger on mobile for impact */}
        <h3 className={`font-black text-white uppercase tracking-wide mb-1 drop-shadow-lg transition-transform duration-300 group-hover:translate-x-1 leading-tight ${
          isLarge ? "text-2xl sm:text-4xl md:text-5xl" : "text-xl sm:text-2xl md:text-3xl"
        }`}>
          {category.name}
        </h3>
        
        {/* Subtitle - visible on mobile */}
        {category.subtitle && (
          <p className="text-white/80 text-xs sm:text-sm max-w-[90%] mb-3 line-clamp-2 drop-shadow">
            {category.subtitle}
          </p>
        )}
        
        {/* CTA Button - more prominent on mobile */}
        <div className="flex items-center gap-2 mt-1">
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
            <span className="text-xs font-bold uppercase tracking-wide text-white group-hover:text-primary-foreground">
              Explore
            </span>
            <ArrowRight size={14} className="text-white group-hover:text-primary-foreground transform group-hover:translate-x-0.5 transition-all duration-300" />
          </div>
        </div>
      </div>

      {/* Decorative corner accent */}
      <div className="absolute top-3 right-3">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/30 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:rotate-90">
          <ArrowRight size={16} className="text-white -rotate-45" />
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
    <section className="py-8 sm:py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section header - mobile optimized */}
        <div className="text-center mb-6 sm:mb-14">
          <span className="inline-flex items-center gap-2 text-primary text-xs sm:text-sm font-bold tracking-widest uppercase mb-3 bg-primary/10 px-4 py-2 rounded-full">
            <Sparkles size={14} />
            Browse Categories
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-foreground uppercase tracking-tight">
            Shop By Category
          </h2>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="w-12 h-1 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full" />
          </div>
        </div>
        
        {/* Mobile-first grid layout */}
        <div className="space-y-3 sm:space-y-5">
          {/* First row - large banners (2 columns on mobile) */}
          {largeCategories.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:gap-5">
              {largeCategories.map((category, idx) => (
                <CategoryCard key={category.id} category={category} isLarge={true} index={idx} />
              ))}
            </div>
          )}
          
          {/* Regular categories - 2 columns on mobile, 3 on desktop */}
          {regularCategories.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5">
              {regularCategories.map((category, idx) => (
                <CategoryCard key={category.id} category={category} index={idx + 2} />
              ))}
            </div>
          )}
        </div>
        
        {/* Mobile scroll hint */}
        <div className="mt-6 text-center sm:hidden">
          <p className="text-muted-foreground text-xs">Tap any category to explore</p>
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
