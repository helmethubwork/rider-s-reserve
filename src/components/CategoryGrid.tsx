import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useCategories, SupabaseCategory } from "@/hooks/useCategories";
import { Skeleton } from "@/components/ui/skeleton";

const LoadingSkeleton = () => (
  <section className="py-10 sm:py-16 md:py-20 bg-background">
    <div className="container mx-auto px-3 sm:px-4">
      <div className="text-center mb-8 sm:mb-12">
        <Skeleton className="h-4 w-32 mx-auto mb-3" />
        <Skeleton className="h-10 w-56 mx-auto" />
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <Skeleton className="aspect-[4/5] rounded-xl" />
        <Skeleton className="aspect-[4/5] rounded-xl" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="aspect-square rounded-xl" />
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
      className={`relative block overflow-hidden group rounded-xl active:scale-[0.98] transition-transform duration-200 ${
        isLarge 
          ? "aspect-[4/5] sm:aspect-[3/4]" 
          : "aspect-square"
      }`}
    >
      {/* Image */}
      <img
        src={category.image_url || '/placeholder.svg'}
        alt={category.name}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
      
      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-start justify-end p-4 sm:p-6">
        <h3 className={`font-black text-foreground uppercase tracking-wide mb-2 ${
          isLarge 
            ? "text-xl sm:text-2xl md:text-3xl" 
            : "text-base sm:text-lg md:text-xl"
        }`}>
          {category.name}
        </h3>
        
        <div className="flex items-center gap-2 text-primary text-xs sm:text-sm font-semibold group-hover:gap-3 transition-all">
          <span>Shop Now</span>
          <ArrowRight size={14} className="sm:w-4 sm:h-4" />
        </div>
      </div>

      {/* Hover border */}
      <div className="absolute inset-0 rounded-xl ring-2 ring-inset ring-transparent group-hover:ring-primary/50 transition-all duration-300" />
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

  // Separate large and regular categories
  const largeCategories = categories.filter(c => c.is_large).slice(0, 2);
  const regularCategories = categories.filter(c => !c.is_large);

  return (
    <section className="py-10 sm:py-16 md:py-20 bg-background">
      <div className="container mx-auto px-3 sm:px-4">
        {/* Section header */}
        <div className="text-center mb-8 sm:mb-12">
          <span className="text-primary text-xs font-bold tracking-widest uppercase mb-2 block">
            Browse Categories
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground tracking-tight">
            Shop By Category
          </h2>
          <div className="w-16 h-1 bg-primary mx-auto mt-4 rounded-full" />
        </div>
        
        {/* Bento Grid Layout */}
        <div className="space-y-3 sm:space-y-4">
          {/* Large categories - 2 columns */}
          {largeCategories.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {largeCategories.map((category) => (
                <CategoryCard key={category.id} category={category} isLarge />
              ))}
            </div>
          )}
          
          {/* Regular categories - 2 cols mobile, 4 cols desktop */}
          {regularCategories.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {regularCategories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
