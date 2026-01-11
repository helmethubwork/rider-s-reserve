import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import helmet1 from "@/assets/products/helmet-1.jpg";
import jacket1 from "@/assets/products/jacket-1.jpg";
import gloves1 from "@/assets/products/gloves-1.jpg";
import intercom1 from "@/assets/products/intercom-1.jpg";
import helmet2 from "@/assets/products/helmet-2.jpg";
import helmet3 from "@/assets/products/helmet-3.jpg";
import visor1 from "@/assets/products/visor-1.jpg";

interface CategoryItem {
  name: string;
  subtitle: string;
  href: string;
  image: string;
}

const categories: CategoryItem[] = [
  { name: "Helmets", subtitle: "Full Face, Modular & More", href: "/category/helmets", image: helmet1 },
  { name: "Jackets", subtitle: "Mesh, Leather & Textile", href: "/category/riding-gears?type=jackets", image: jacket1 },
  { name: "Gloves", subtitle: "Racing & Touring", href: "/category/riding-gears?type=gloves", image: gloves1 },
  { name: "Pants", subtitle: "Riding Jeans & Pants", href: "/category/riding-gears?type=pants", image: helmet2 },
  { name: "Boots", subtitle: "Touring & Racing Boots", href: "/category/riding-gears?type=boots", image: helmet3 },
  { name: "Communication", subtitle: "Intercoms & Bluetooth", href: "/category/helmet-accessories?type=intercoms", image: intercom1 },
  { name: "Luggage", subtitle: "Saddlebags & Tank Bags", href: "/category/motorcycle-accessories?type=luggage", image: visor1 },
  { name: "Accessories", subtitle: "Visors, Locks & More", href: "/category/motorcycle-accessories", image: gloves1 },
];

const CategoryCard = ({ category, isLarge = false }: { category: CategoryItem; isLarge?: boolean }) => {
  return (
    <Link
      to={category.href}
      className={`relative block overflow-hidden group rounded-xl sm:rounded-2xl active:scale-[0.98] transition-transform ${
        isLarge ? "min-h-[280px] sm:min-h-[380px] md:min-h-[520px]" : "min-h-[200px] sm:min-h-[280px] md:min-h-[380px]"
      }`}
    >
      {/* Image with zoom effect */}
      <img
        src={category.image}
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
        <p className="text-muted-foreground text-xs sm:text-sm md:text-base max-w-xs mb-2 sm:mb-4 line-clamp-1 sm:line-clamp-none">
          {category.subtitle}
        </p>
        
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
        
        {/* First row - 2 large banners */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 mb-3 sm:mb-5">
          <CategoryCard category={categories[0]} isLarge={true} />
          <CategoryCard category={categories[1]} isLarge={true} />
        </div>
        
        {/* Second row - 3 medium banners */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5 mb-3 sm:mb-5">
          <CategoryCard category={categories[2]} />
          <CategoryCard category={categories[3]} />
          <CategoryCard category={categories[4]} />
        </div>
        
        {/* Third row - 3 medium banners */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5">
          <CategoryCard category={categories[5]} />
          <CategoryCard category={categories[6]} />
          <CategoryCard category={categories[7]} />
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
