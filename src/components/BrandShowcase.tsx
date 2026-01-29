import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useFeaturedBrands } from "@/hooks/useBrands";
import { Skeleton } from "@/components/ui/skeleton";
import { brands as localBrands } from "@/data/brands";

const LoadingSkeleton = () => (
  <section className="py-12 sm:py-16 md:py-20 bg-background border-t border-border/50">
    <div className="container mx-auto px-3 sm:px-4">
      <div className="text-center mb-8 sm:mb-10">
        <Skeleton className="h-4 w-32 mx-auto mb-3" />
        <Skeleton className="h-8 w-48 mx-auto" />
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="aspect-[3/2] rounded-lg" />
        ))}
      </div>
    </div>
  </section>
);

// Helper to get local logo by slug
const getLocalLogo = (slug: string): string | null => {
  const localBrand = localBrands.find(b => b.slug === slug);
  return localBrand?.logo || null;
};

const BrandShowcase = () => {
  const { data: dbBrands = [], isLoading } = useFeaturedBrands();

  // Merge database brands with local logos as fallback
  const brands = dbBrands.length > 0 
    ? dbBrands.map(brand => ({
        ...brand,
        logo_url: brand.logo_url || getLocalLogo(brand.slug)
      }))
    : localBrands.filter(b => b.featured).map(b => ({
        id: b.slug,
        name: b.name,
        slug: b.slug,
        logo_url: b.logo,
        description: b.description,
        is_featured: true,
        is_active: true,
        display_order: 0,
        created_at: ''
      }));

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (brands.length === 0) {
    return null;
  }

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-background border-t border-border/50">
      <div className="container mx-auto px-3 sm:px-4">
        {/* Section header */}
        <div className="text-center mb-8 sm:mb-10">
          <span className="text-primary text-xs font-bold tracking-widest uppercase mb-2 block">
            Trusted Partners
          </span>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            Brands We Work With
          </h2>
        </div>

        {/* Brands Grid - Uniform tiles */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
          {brands.slice(0, 6).map((brand) => (
            <Link
              key={brand.id}
              to={`/brands/${brand.slug}`}
              className="group aspect-[3/2] bg-card border border-border/50 rounded-lg flex items-center justify-center p-4 transition-all duration-300 hover:border-primary/50 hover:shadow-lg"
            >
              <img 
                src={brand.logo_url || '/placeholder.svg'} 
                alt={`${brand.name} logo`}
                className="max-w-full max-h-full object-contain opacity-70 group-hover:opacity-100 transition-opacity"
                loading="lazy"
              />
            </Link>
          ))}
        </div>

        {/* View all link */}
        <div className="flex justify-center mt-8">
          <Link
            to="/brands"
            className="group inline-flex items-center gap-2 text-primary font-bold text-sm hover:underline underline-offset-4"
          >
            View All Brands
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BrandShowcase;
