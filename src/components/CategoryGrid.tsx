import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useCategories, SupabaseCategory } from "@/hooks/useCategories";
import { Skeleton } from "@/components/ui/skeleton";

const LoadingSkeleton = () => (
  <section className="py-10 sm:py-16 md:py-24 bg-background">
    <div className="container mx-auto px-3 sm:px-4">
      <div className="text-center mb-8 sm:mb-14">
        <Skeleton className="h-4 w-32 mx-auto mb-4" />
        <Skeleton className="h-10 w-64 mx-auto" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 mb-3 sm:mb-5">
        <Skeleton className="min-h-[280px] sm:min-h-[380px] md:min-h-[520px] rounded-xl" />
        <Skeleton className="min-h-[280px] sm:min-h-[380px] md:min-h-[520px] rounded-xl" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="min-h-[200px] sm:min-h-[280px] md:min-h-[380px] rounded-xl" />
        ))}
      </div>
    </div>
  </section>
);

const CategoryCard = ({ category, isLarge = false }: { category: SupabaseCategory; isLarge?: boolean }) => {
  const href = category.href || `/category/${category.slug}`;
  
  return (
    <Link
      to={href}
      className={`relative block overflow-hidden group rounded-xl sm:rounded-2xl active:scale-[0.98] transition-transform ${
        isLarge ? "min-h-[280px] sm:min-h-[380px] md:min-h-[520px]" : "min-h-[200px] sm:min-h-[280px] md:min-h-[380px]"
      }`}
    >
      {/* Image with zoom effect */}
      <img
        src={category.image_url || '/placeholder.svg'}
        alt={category.name}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 absolute inset-0"
        loading="lazy"
      />
      
      {/* Multi-layer gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-90" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Glowing border on hover */}
      <div className="absolute inset-0 rounded-xl sm:rounded-2xl border-2 border-transparent group-hover:border-primary/60 transition-all duration-500" />
      
      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-start justify-end p-4 sm:p-6 md:p-8">
        {/* Shop Now tag */}
        <span className="inline-flex items-center gap-1.5 sm:gap-2 bg-primary/20 backdrop-blur-sm text-primary text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full mb-2 sm:mb-4 border border-primary/30">
          <span className="w-1 sm:w-1.5 h-1 sm:h-1.5 bg-primary rounded-full animate-pulse" />
          Shop Now
        </span>
        
        {/* Category name */}
        <h3 className={`font-black text-foreground uppercase tracking-wide mb-1 sm:mb-2 transition-transform duration-300 group-hover:translate-x-2 ${
          isLarge ? "text-2xl sm:text-4xl md:text-5xl lg:text-6xl" : "text-xl sm:text-2xl md:text-3xl lg:text-4xl"
        }`}>
          {category.name}
        </h3>
        
        {/* Subtitle */}
        {category.subtitle && (
          <p className="text-muted-foreground text-xs sm:text-sm md:text-base max-w-xs mb-2 sm:mb-4 line-clamp-1 sm:line-clamp-none">
            {category.subtitle}
          </p>
        )}
        
        {/* Arrow indicator */}
        <div className="flex items-center gap-2 sm:gap-3 text-primary overflow-hidden">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider transform -translate-x-full opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 hidden sm:block">
            Explore Collection
          </span>
          <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
            <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px] transform group-hover:translate-x-0.5 transition-transform duration-300" />
          </div>
        </div>
      </div>

      {/* Corner accent */}
      <div className="absolute top-0 right-0 w-16 sm:w-20 h-16 sm:h-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br from-primary/20 to-transparent transform rotate-45 translate-x-12 sm:translate-x-16 -translate-y-12 sm:-translate-y-16 group-hover:translate-x-10 sm:group-hover:translate-x-12 group-hover:-translate-y-10 sm:group-hover:-translate-y-12 transition-transform duration-500" />
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

  // Split regular categories into rows of 3
  const row2 = regularCategories.slice(0, 3);
  const row3 = regularCategories.slice(3, 6);

  return (
    <section className="py-10 sm:py-16 md:py-24 bg-background">
      <div className="container mx-auto px-3 sm:px-4">
        {/* Section header */}
        <div className="text-center mb-8 sm:mb-14">
          <span className="text-primary text-xs sm:text-sm font-bold tracking-[0.2em] sm:tracking-[0.3em] uppercase mb-3 sm:mb-4 block">
            Browse Categories
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-foreground uppercase tracking-tight">
            Shop By Category
          </h2>
          <div className="flex items-center justify-center gap-2 mt-4 sm:mt-6">
            <div className="w-10 sm:w-16 h-1 bg-primary rounded-full" />
            <div className="w-2 sm:w-3 h-2 sm:h-3 bg-primary rounded-full" />
            <div className="w-10 sm:w-16 h-1 bg-primary rounded-full" />
          </div>
        </div>
        
        {/* First row - large banners */}
        {largeCategories.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 mb-3 sm:mb-5">
            {largeCategories.map((category) => (
              <CategoryCard key={category.id} category={category} isLarge={true} />
            ))}
          </div>
        )}
        
        {/* Second row - medium banners */}
        {row2.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5 mb-3 sm:mb-5">
            {row2.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
        
        {/* Third row - medium banners */}
        {row3.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5">
            {row3.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoryGrid;
